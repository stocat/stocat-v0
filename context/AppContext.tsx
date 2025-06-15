"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { Stock, HoldingStock, Balance, User, Portfolio, TradingSession, TradingLimits } from "../types"
import { apiService } from "../services/api"
import { webSocketService } from "../services/websocket"

// ============================================================================
// 전역 상태 관리 - 실제 API 연동 시 일부 수정 필요
// ============================================================================

interface AppState {
  user: User | null
  isAuthenticated: boolean
  balance: Balance
  portfolio: Portfolio
  tradingSession: TradingSession
  loading: boolean
  error: string | null
}

type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_BALANCE"; payload: Balance }
  | { type: "SET_PORTFOLIO"; payload: Portfolio }
  | { type: "SET_TRADING_SESSION"; payload: TradingSession }
  | { type: "UPDATE_STOCK_PRICES"; payload: Stock[] }
  | { type: "UPDATE_HOLDINGS"; payload: HoldingStock[] }
  | { type: "UPDATE_TRADING_LIMITS"; payload: TradingLimits }

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  balance: { krw: 0, usd: 0 },
  portfolio: {
    totalValue: 0,
    totalCost: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    holdings: [],
  },
  tradingSession: {
    canBuyToday: true, // 실제 연동 시: 서버에서 받아올 값
    todayStocks: [],
    lastUpdated: "",
    tradingLimits: {
      canBuyToday: true,
      maxStockTypes: 5,
      currentStockTypes: 0,
    },
  },
  loading: false,
  error: null,
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
    case "UPDATE_STOCK_PRICES":
      return {
        ...state,
        tradingSession: {
          ...state.tradingSession,
          todayStocks: action.payload,
          lastUpdated: new Date().toISOString(),
        },
      }
    case "UPDATE_HOLDINGS":
      const updatedHoldings = action.payload
      const totalValue = updatedHoldings.reduce((sum, stock) => sum + stock.price * stock.quantity, 0)
      const totalCost = updatedHoldings.reduce((sum, stock) => sum + stock.avgPrice * stock.quantity, 0)
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
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  actions: {
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    register: (email: string, password: string, name: string) => Promise<void>
    buyStock: (stockId: string, quantity: number) => Promise<void>
    sellStock: (stockId: string, quantity: number) => Promise<void>
    refreshData: () => Promise<void>
  }
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // ============================================================================
  // WebSocket 연결 및 실시간 데이터 수신 - 실제 연동 시 그대로 사용 가능
  // ============================================================================
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      const token = localStorage.getItem("auth_token")
      if (token) {
        console.log("WebSocket 연결 시작...")
        webSocketService.connect(token)

        // 주식 가격 업데이트 구독
        const handleStockUpdate = (stocks: Stock[]) => {
          console.log("주식 가격 업데이트 수신:", stocks.length, "개")
          dispatch({ type: "UPDATE_STOCK_PRICES", payload: stocks })
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
    }

    return () => {
      webSocketService.disconnect()
    }
  }, [state.isAuthenticated, state.user])

  const actions = {
    // ============================================================================
    // 로그인 액션 - 실제 연동 시 에러 처리 강화 필요
    // ============================================================================
    login: async (email: string, password: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })

        console.log("로그인 시도:", email)
        const response = await apiService.login(email, password)

        dispatch({ type: "SET_USER", payload: response.user })
        dispatch({ type: "SET_AUTHENTICATED", payload: true })

        // 로그인 성공 후 초기 데이터 로드
        await actions.refreshData()

        console.log("로그인 성공")
      } catch (error: any) {
        console.error("로그인 실패:", error)
        dispatch({ type: "SET_ERROR", payload: error.message || "로그인에 실패했습니다." })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    // ============================================================================
    // 로그아웃 액션 - 실제 연동 시 그대로 사용 가능
    // ============================================================================
    logout: async () => {
      try {
        console.log("로그아웃 시도")
        await apiService.logout()
        webSocketService.disconnect()

        // 상태 초기화
        dispatch({ type: "SET_USER", payload: null })
        dispatch({ type: "SET_AUTHENTICATED", payload: false })
        dispatch({ type: "SET_BALANCE", payload: { krw: 0, usd: 0 } })
        dispatch({ type: "SET_PORTFOLIO", payload: initialState.portfolio })
        dispatch({ type: "SET_TRADING_SESSION", payload: initialState.tradingSession })

        console.log("로그아웃 완료")
      } catch (error) {
        console.error("로그아웃 오류:", error)
      }
    },

    // ============================================================================
    // 회원가입 액션 - 실제 연동 시 에러 처리 강화 필요
    // ============================================================================
    register: async (email: string, password: string, name: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })

        console.log("회원가입 시도:", email, name)
        await apiService.register(email, password, name)

        // 회원가입 후 자동 로그인
        await actions.login(email, password)

        console.log("회원가입 및 로그인 완료")
      } catch (error: any) {
        console.error("회원가입 실패:", error)
        dispatch({ type: "SET_ERROR", payload: error.message || "회원가입에 실패했습니다." })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    // ============================================================================
    // 주식 구매 액션 - 실제 연동 시 에러 처리 강화 필요
    // ============================================================================
    buyStock: async (stockId: string, quantity: number) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })

        console.log("주식 구매 시도:", stockId, quantity, "주")
        await apiService.buyStock(stockId, quantity)

        // 구매 후 데이터 새로고침
        await actions.refreshData()

        console.log("주식 구매 완료")
      } catch (error: any) {
        console.error("주식 구매 실패:", error)
        dispatch({ type: "SET_ERROR", payload: error.message || "주식 구매에 실패했습니다." })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    // ============================================================================
    // 주식 판매 액션 - 실제 연동 시 에러 처리 강화 필요
    // ============================================================================
    sellStock: async (stockId: string, quantity: number) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })

        console.log("주식 판매 시도:", stockId, quantity, "주")
        await apiService.sellStock(stockId, quantity)

        // 판매 후 데이터 새로고침
        await actions.refreshData()

        console.log("주식 판매 완료")
      } catch (error: any) {
        console.error("주식 판매 실패:", error)
        dispatch({ type: "SET_ERROR", payload: error.message || "주식 판매에 실패했습니다." })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },

    // ============================================================================
    // 데이터 새로고침 - 실제 연동 시 에러 처리 강화 필요
    // ============================================================================
    refreshData: async () => {
      try {
        console.log("데이터 새로고침 시작")

        // 병렬로 데이터 요청 (성능 최적화)
        const [portfolio, balance, todayStocks, tradingLimits] = await Promise.all([
          apiService.getPortfolio(),
          apiService.getBalance(),
          apiService.getTodayStocks(),
          apiService.getTradingLimits(),
        ])

        dispatch({ type: "SET_PORTFOLIO", payload: portfolio })
        dispatch({ type: "SET_BALANCE", payload: balance })
        dispatch({
          type: "SET_TRADING_SESSION",
          payload: {
            canBuyToday: tradingLimits.canBuyToday,
            todayStocks,
            lastUpdated: new Date().toISOString(),
            tradingLimits,
          },
        })

        console.log("데이터 새로고침 완료")
      } catch (error: any) {
        console.error("데이터 새로고침 실패:", error)
        dispatch({ type: "SET_ERROR", payload: error.message || "데이터 로드에 실패했습니다." })
      }
    },
  }

  return <AppContext.Provider value={{ state, dispatch, actions }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
