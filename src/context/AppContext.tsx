"use client"

import type React from "react"
import { createContext, useContext, useEffect, useReducer } from "react"
import { apiService } from "../services/api"
import { webSocketService } from "../services/websocket"
import type { Balance, HoldingStock, Portfolio, Stock, TradingLimits, TradingSession, User, MarketType } from "../types"

interface AppState {
  user: User | null
  isAuthenticated: boolean
  balance: Balance
  portfolio: Portfolio
  tradingSession: TradingSession
  loading: boolean
  error: string | null
  wsConnected: boolean
  activeMarket: MarketType
}

type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_BALANCE"; payload: Balance }
  | { type: "SET_PORTFOLIO"; payload: Portfolio }
  | { type: "SET_TRADING_SESSION"; payload: TradingSession }
  | { type: "UPDATE_ALL_STOCKS"; payload: { domestic: Stock[]; international: Stock[]; crypto: Stock[] } }
  | { type: "UPDATE_HOLDINGS"; payload: HoldingStock[] }
  | { type: "UPDATE_TRADING_LIMITS"; payload: TradingLimits }
  | { type: "SET_WS_CONNECTED"; payload: boolean }
  | { type: "SET_ACTIVE_MARKET"; payload: MarketType }

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  balance: { krw: 0, usd: 0 },
  portfolio: { totalValue: 0, totalCost: 0, totalReturn: 0, totalReturnPercent: 0, holdings: [] },
  tradingSession: {
    canBuyToday: true,
    domesticStocks: [],
    internationalStocks: [],
    cryptoStocks: [],
    lastUpdated: "",
    tradingLimits: { canBuyToday: true, maxStockTypes: 5, currentStockTypes: 0 },
  },
  loading: false,
  error: null,
  wsConnected: false,
  activeMarket: "domestic",
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload }
    case "SET_BALANCE":
      return { ...state, balance: action.payload }
    case "SET_PORTFOLIO":
      return { ...state, portfolio: action.payload }
    case "SET_TRADING_SESSION":
      return { ...state, tradingSession: action.payload }
    case "UPDATE_ALL_STOCKS":
      return {
        ...state,
        tradingSession: {
          ...state.tradingSession,
          domesticStocks: action.payload.domestic,
          internationalStocks: action.payload.international,
          cryptoStocks: action.payload.crypto,
          lastUpdated: new Date().toISOString(),
        },
      }
    case "UPDATE_HOLDINGS":
      const updatedHoldings = action.payload
      const totalValue = updatedHoldings.reduce((sum, stock) => {
        const valueInKrw =
          stock.market === "domestic" ? stock.price * stock.quantity : stock.price * stock.quantity * 1200
        return sum + valueInKrw
      }, 0)
      const totalCost = updatedHoldings.reduce((sum, stock) => {
        const costInKrw =
          stock.market === "domestic" ? stock.avgPrice * stock.quantity : stock.avgPrice * stock.quantity * 1200
        return sum + costInKrw
      }, 0)
      const totalReturn = totalValue - totalCost
      const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0

      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          holdings: updatedHoldings,
          totalValue,
          totalCost,
          totalReturn,
          totalReturnPercent,
        },
      }
    case "UPDATE_TRADING_LIMITS":
      return {
        ...state,
        tradingSession: {
          ...state.tradingSession,
          tradingLimits: action.payload,
          canBuyToday: action.payload.canBuyToday,
        },
      }
    case "SET_WS_CONNECTED":
      return { ...state, wsConnected: action.payload }
    case "SET_ACTIVE_MARKET":
      return { ...state, activeMarket: action.payload }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  actions: {
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    register: (email: string, password: string, name: string) => Promise<void>
    buyStock: (stockId: string, quantity: number) => Promise<void>
    refreshData: () => Promise<void>
    setActiveMarket: (market: MarketType) => void
  }
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // WebSocket 연결 및 실시간 데이터 수신
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      console.log("WebSocket 연결 시작...")

      // 모킹: 토큰 없이 연결 (실제 연동 시 실제 토큰 사용)
      webSocketService.connect("mock_token")
      dispatch({ type: "SET_WS_CONNECTED", payload: true })

      // 주식 가격 업데이트 구독
      const handleStockUpdate = (stocks: { domestic: Stock[]; international: Stock[]; crypto: Stock[] }) => {
        console.log("주식 가격 업데이트 수신:", stocks)
        dispatch({ type: "UPDATE_ALL_STOCKS", payload: stocks })
      }

      // 포트폴리오 업데이트 구독
      const handlePortfolioUpdate = (holdings: HoldingStock[]) => {
        console.log("포트폴리오 업데이트 수신:", holdings.length, "개")
        dispatch({ type: "UPDATE_HOLDINGS", payload: holdings })
      }

      // 잔고 업데이트 구독
      const handleBalanceUpdate = (balance: Balance) => {
        console.log("잔고 업데이트 수신:", balance)
        dispatch({ type: "SET_BALANCE", payload: balance })
      }

      // 거래 제한 업데이트 구독
      const handleTradingLimitsUpdate = (limits: TradingLimits) => {
        console.log("거래 제한 업데이트 수신:", limits)
        dispatch({ type: "UPDATE_TRADING_LIMITS", payload: limits })
      }

      webSocketService.subscribe("STOCK_UPDATE", handleStockUpdate)
      webSocketService.subscribe("PORTFOLIO_UPDATE", handlePortfolioUpdate)
      webSocketService.subscribe("BALANCE_UPDATE", handleBalanceUpdate)
      webSocketService.subscribe("TRADING_LIMITS_UPDATE", handleTradingLimitsUpdate)

      // 컴포넌트 언마운트 시 구독 해제
      return () => {
        webSocketService.unsubscribe("STOCK_UPDATE", handleStockUpdate)
        webSocketService.unsubscribe("PORTFOLIO_UPDATE", handlePortfolioUpdate)
        webSocketService.unsubscribe("BALANCE_UPDATE", handleBalanceUpdate)
        webSocketService.unsubscribe("TRADING_LIMITS_UPDATE", handleTradingLimitsUpdate)
      }
    }

    return () => {
      webSocketService.disconnect()
      dispatch({ type: "SET_WS_CONNECTED", payload: false })
    }
  }, [state.isAuthenticated, state.user])

  useEffect(() => {
    apiService.initializeToken()
  }, [])

  const actions = {
    login: async (email: string, password: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })
        const response = await apiService.login(email, password)
        dispatch({ type: "SET_USER", payload: response.user })
        dispatch({ type: "SET_AUTHENTICATED", payload: true })
        await actions.refreshData()
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message || "로그인에 실패했습니다." })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    logout: async () => {
      try {
        await apiService.logout()
        webSocketService.disconnect()
        dispatch({ type: "SET_USER", payload: null })
        dispatch({ type: "SET_AUTHENTICATED", payload: false })
        dispatch({ type: "SET_BALANCE", payload: { krw: 0, usd: 0 } })
        dispatch({ type: "SET_PORTFOLIO", payload: initialState.portfolio })
        dispatch({ type: "SET_TRADING_SESSION", payload: initialState.tradingSession })
        dispatch({ type: "SET_WS_CONNECTED", payload: false })
        dispatch({ type: "SET_ACTIVE_MARKET", payload: "domestic" })
      } catch (error) {
        console.error("로그아웃 오류:", error)
      }
    },

    register: async (email: string, password: string, name: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })
        await apiService.register(email, password, name)
        await actions.login(email, password)
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message || "회원가입에 실패했습니다." })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    buyStock: async (stockId: string, quantity: number) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })
        await apiService.buyStock(stockId, quantity)
        await actions.refreshData()
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message || "주식 구매에 실패했습니다." })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    refreshData: async () => {
      try {
        const [portfolio, balance, allStocks, tradingLimits] = await Promise.all([
          apiService.getPortfolio(),
          apiService.getBalance(),
          apiService.getAllStocks(),
          apiService.getTradingLimits(),
        ])

        dispatch({ type: "SET_PORTFOLIO", payload: portfolio })
        dispatch({ type: "SET_BALANCE", payload: balance })
        dispatch({
          type: "SET_TRADING_SESSION",
          payload: {
            canBuyToday: tradingLimits.canBuyToday,
            domesticStocks: allStocks.domestic,
            internationalStocks: allStocks.international,
            cryptoStocks: allStocks.crypto,
            lastUpdated: new Date().toISOString(),
            tradingLimits,
          },
        })
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.message || "데이터 로드에 실패했습니다." })
      }
    },

    setActiveMarket: (market: MarketType) => {
      dispatch({ type: "SET_ACTIVE_MARKET", payload: market })
    },
  }

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within an AppProvider")
  return context
}
