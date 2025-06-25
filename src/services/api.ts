import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Balance, HoldingStock, Portfolio, Stock, TradingLimits, MarketType } from "../types"

// 국내 주식 모킹 데이터
const MOCK_DOMESTIC_STOCKS: Stock[] = [
  { id: "1", name: "삼성전자", code: "005930", price: 71500, change: 1500, changePercent: 2.14, market: "domestic" },
  {
    id: "2",
    name: "SK하이닉스",
    code: "000660",
    price: 128000,
    change: -2000,
    changePercent: -1.54,
    market: "domestic",
  },
  { id: "3", name: "NAVER", code: "035420", price: 185000, change: 3500, changePercent: 1.93, market: "domestic" },
  { id: "4", name: "카카오", code: "035720", price: 45200, change: -800, changePercent: -1.74, market: "domestic" },
  {
    id: "5",
    name: "LG에너지솔루션",
    code: "373220",
    price: 412000,
    change: 8000,
    changePercent: 1.98,
    market: "domestic",
  },
]

// 해외 주식 모킹 데이터
const MOCK_INTERNATIONAL_STOCKS: Stock[] = [
  {
    id: "6",
    name: "Apple Inc.",
    code: "AAPL",
    price: 175.43,
    change: 3.69,
    changePercent: 2.15,
    market: "international",
  },
  {
    id: "7",
    name: "Microsoft Corp.",
    code: "MSFT",
    price: 378.85,
    change: 4.68,
    changePercent: 1.25,
    market: "international",
  },
  {
    id: "8",
    name: "Alphabet Inc.",
    code: "GOOGL",
    price: 138.21,
    change: -1.21,
    changePercent: -0.87,
    market: "international",
  },
  {
    id: "9",
    name: "Tesla Inc.",
    code: "TSLA",
    price: 248.5,
    change: 10.3,
    changePercent: 4.32,
    market: "international",
  },
  {
    id: "10",
    name: "Amazon.com Inc.",
    code: "AMZN",
    price: 151.94,
    change: -3.26,
    changePercent: -2.1,
    market: "international",
  },
]

// 코인 모킹 데이터
const MOCK_CRYPTO_STOCKS: Stock[] = [
  { id: "11", name: "Bitcoin", code: "BTC", price: 43250.0, change: 2320.5, changePercent: 5.67, market: "crypto" },
  { id: "12", name: "Ethereum", code: "ETH", price: 2650.75, change: -63.45, changePercent: -2.34, market: "crypto" },
  { id: "13", name: "Binance Coin", code: "BNB", price: 315.2, change: 9.8, changePercent: 3.21, market: "crypto" },
  { id: "14", name: "Cardano", code: "ADA", price: 0.485, change: -0.023, changePercent: -4.56, market: "crypto" },
  { id: "15", name: "Solana", code: "SOL", price: 98.75, change: 7.22, changePercent: 7.89, market: "crypto" },
]

const MOCK_USER = { id: "user123", email: "test@example.com", name: "테스트 사용자", createdAt: "2024-01-01T00:00:00Z" }
const MOCK_HOLDINGS: HoldingStock[] = []
const MOCK_BALANCE = { krw: 1000000, usd: 750 }
let MOCK_DAILY_PURCHASE_USED = false
const MOCK_MAX_STOCK_TYPES = 5

class ApiService {
  private token: string | null = null

  async initializeToken() {
    this.token = await AsyncStorage.getItem("auth_token")
  }

  private async mockDelay(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async login(email: string, password: string) {
    await this.mockDelay(1000)
    if (email && password) {
      const mockToken = "mock_jwt_token_" + Date.now()
      this.token = mockToken
      await AsyncStorage.setItem("auth_token", mockToken)
      MOCK_DAILY_PURCHASE_USED = false
      return { success: true, token: mockToken, user: MOCK_USER }
    } else {
      throw new Error("이메일과 비밀번호를 입력해주세요.")
    }
  }

  async register(email: string, password: string, name: string) {
    await this.mockDelay(1000)
    if (email && password && name) {
      return { success: true, message: "회원가입이 완료되었습니다." }
    } else {
      throw new Error("모든 필드를 입력해주세요.")
    }
  }

  async logout() {
    this.token = null
    await AsyncStorage.removeItem("auth_token")
  }

  async getTradingLimits(): Promise<TradingLimits> {
    await this.mockDelay(300)
    return {
      canBuyToday: !MOCK_DAILY_PURCHASE_USED,
      maxStockTypes: MOCK_MAX_STOCK_TYPES,
      currentStockTypes: MOCK_HOLDINGS.length,
    }
  }

  async getStocksByMarket(market: MarketType): Promise<Stock[]> {
    await this.mockDelay(500)
    switch (market) {
      case "domestic":
        return MOCK_DOMESTIC_STOCKS
      case "international":
        return MOCK_INTERNATIONAL_STOCKS
      case "crypto":
        return MOCK_CRYPTO_STOCKS
      default:
        return []
    }
  }

  async getAllStocks(): Promise<{ domestic: Stock[]; international: Stock[]; crypto: Stock[] }> {
    await this.mockDelay(500)
    return {
      domestic: MOCK_DOMESTIC_STOCKS,
      international: MOCK_INTERNATIONAL_STOCKS,
      crypto: MOCK_CRYPTO_STOCKS,
    }
  }

  async buyStock(stockId: string, quantity: number) {
    await this.mockDelay(800)

    if (MOCK_DAILY_PURCHASE_USED) {
      throw new Error("오늘은 이미 구매하셨습니다. 내일 다시 시도해주세요.")
    }

    const allStocks = [...MOCK_DOMESTIC_STOCKS, ...MOCK_INTERNATIONAL_STOCKS, ...MOCK_CRYPTO_STOCKS]
    const stock = allStocks.find((s) => s.id === stockId)
    if (!stock) throw new Error("주식을 찾을 수 없습니다.")

    // 마켓별 통화 처리
    const totalCost = stock.price * quantity
    const currency = stock.market === "domestic" ? "krw" : "usd"
    const balance = currency === "krw" ? MOCK_BALANCE.krw : MOCK_BALANCE.usd

    if (totalCost > balance) {
      throw new Error(`${currency === "krw" ? "원화" : "달러"} 잔고가 부족합니다.`)
    }

    const existingHolding = MOCK_HOLDINGS.find((h) => h.id === stockId)
    if (!existingHolding && MOCK_HOLDINGS.length >= MOCK_MAX_STOCK_TYPES) {
      throw new Error(`최대 ${MOCK_MAX_STOCK_TYPES}개 종류의 주식만 보유할 수 있습니다.`)
    }

    // 잔고 차감
    if (currency === "krw") {
      MOCK_BALANCE.krw -= totalCost
    } else {
      MOCK_BALANCE.usd -= totalCost
    }

    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity
      const newAvgPrice = (existingHolding.avgPrice * existingHolding.quantity + stock.price * quantity) / newQuantity
      existingHolding.quantity = newQuantity
      existingHolding.avgPrice = Math.round(newAvgPrice * 100) / 100
    } else {
      MOCK_HOLDINGS.push({ ...stock, quantity, avgPrice: stock.price, purchaseDate: new Date().toISOString() })
    }

    MOCK_DAILY_PURCHASE_USED = true
    return { success: true, message: "구매가 완료되었습니다." }
  }

  async getPortfolio(): Promise<Portfolio> {
    await this.mockDelay(400)
    const totalValue = MOCK_HOLDINGS.reduce((sum, stock) => {
      // 환율 적용 (간단히 1200원/달러로 가정)
      const valueInKrw =
        stock.market === "domestic" ? stock.price * stock.quantity : stock.price * stock.quantity * 1200
      return sum + valueInKrw
    }, 0)

    const totalCost = MOCK_HOLDINGS.reduce((sum, stock) => {
      const costInKrw =
        stock.market === "domestic" ? stock.avgPrice * stock.quantity : stock.avgPrice * stock.quantity * 1200
      return sum + costInKrw
    }, 0)

    const totalReturn = totalValue - totalCost
    const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0

    return { totalValue, totalCost, totalReturn, totalReturnPercent, holdings: MOCK_HOLDINGS }
  }

  async getBalance(): Promise<Balance> {
    await this.mockDelay(200)
    return MOCK_BALANCE
  }

  // 실시간 가격 업데이트용 모킹 함수
  updateMockPrices() {
    const updateStockPrices = (stocks: Stock[]) => {
      stocks.forEach((stock) => {
        const changeAmount =
          (Math.random() - 0.5) * (stock.market === "crypto" ? 1000 : stock.market === "international" ? 5 : 2000)
        const newPrice = Math.max(
          stock.price + changeAmount,
          stock.market === "crypto" && stock.price < 1 ? 0.001 : 1000,
        )
        const newChange = newPrice - (stock.price - stock.change)
        const newChangePercent = (newChange / (newPrice - newChange)) * 100

        stock.price =
          stock.market === "crypto" && stock.price < 1
            ? Math.round(newPrice * 10000) / 10000
            : Math.round(newPrice * 100) / 100
        stock.change = Math.round(newChange * 100) / 100
        stock.changePercent = Number(newChangePercent.toFixed(2))
      })
    }

    updateStockPrices(MOCK_DOMESTIC_STOCKS)
    updateStockPrices(MOCK_INTERNATIONAL_STOCKS)
    updateStockPrices(MOCK_CRYPTO_STOCKS)

    // 보유 주식 가격도 업데이트
    MOCK_HOLDINGS.forEach((holding) => {
      const allStocks = [...MOCK_DOMESTIC_STOCKS, ...MOCK_INTERNATIONAL_STOCKS, ...MOCK_CRYPTO_STOCKS]
      const mockStock = allStocks.find((s) => s.id === holding.id)
      if (mockStock) {
        holding.price = mockStock.price
        holding.change = mockStock.change
        holding.changePercent = mockStock.changePercent
      }
    })
  }

  // 실시간 업데이트 시작
  startRealTimeUpdates(callback: () => void) {
    return setInterval(() => {
      this.updateMockPrices()
      callback()
    }, 3000) // 3초마다 업데이트
  }

  // 실시간 업데이트 중지
  stopRealTimeUpdates(intervalId: NodeJS.Timeout) {
    clearInterval(intervalId)
  }
}

export const apiService = new ApiService()
