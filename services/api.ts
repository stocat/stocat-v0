// ============================================================================
// API 서비스 - 실제 Spring Boot 백엔드 연동 시 수정 필요
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

// 모킹 데이터 - 실제 연동 시 제거 필요 (고정된 5개 주식)
const MOCK_TODAY_STOCKS = [
  { id: "1", name: "삼성전자", code: "005930", price: 71500, change: 1500, changePercent: 2.14 },
  { id: "2", name: "SK하이닉스", code: "000660", price: 128000, change: -2000, changePercent: -1.54 },
  { id: "3", name: "NAVER", code: "035420", price: 185000, change: 3500, changePercent: 1.93 },
  { id: "4", name: "카카오", code: "035720", price: 45200, change: -800, changePercent: -1.74 },
  { id: "5", name: "LG에너지솔루션", code: "373220", price: 412000, change: 8000, changePercent: 1.98 },
]

// 모킹 사용자 데이터 - 실제 연동 시 제거 필요
const MOCK_USER = {
  id: "user123",
  email: "test@example.com",
  name: "테스트 사용자",
  createdAt: "2024-01-01T00:00:00Z",
}

// 모킹 포트폴리오 데이터 - 실제 연동 시 제거 필요
const MOCK_HOLDINGS: any[] = []
const MOCK_BALANCE = { krw: 1000000, usd: 750 }

// 모킹 거래 제한 데이터 - 실제 연동 시 서버에서 관리
let MOCK_DAILY_PURCHASE_USED = false // 오늘 구매 사용 여부
const MOCK_MAX_STOCK_TYPES = 5 // 최대 보유 가능한 주식 종류

// 모킹 거래 내역 데이터 - 실제 연동 시 서버에서 관리
const MOCK_TRADE_HISTORY: any[] = []

class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // 실제 연동 시: localStorage에서 토큰 가져오기
    this.token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  }

  // 실제 API 요청 함수 - 현재는 모킹, 실제 연동 시 활성화 필요
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      "Content-Type": "application/json",
      // 실제 연동 시: JWT 토큰을 Authorization 헤더에 포함
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    try {
      // 실제 연동 시: 아래 fetch 요청 활성화
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // 모킹용 딜레이 함수 - 실제 연동 시 제거 필요
  private async mockDelay(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // ============================================================================
  // 인증 관련 API - Spring Boot 연동 시 수정 필요
  // ============================================================================

  async login(email: string, password: string) {
    // 현재: 모킹 처리
    await this.mockDelay(1000)

    // 간단한 유효성 검사 (모킹용)
    if (email && password) {
      const mockToken = "mock_jwt_token_" + Date.now()
      this.token = mockToken
      localStorage.setItem("auth_token", mockToken)

      // 모킹: 로그인 시 일일 구매 제한 초기화 (실제로는 서버에서 날짜 기준으로 관리)
      MOCK_DAILY_PURCHASE_USED = false

      return {
        success: true,
        token: mockToken,
        user: MOCK_USER,
      }
    } else {
      throw new Error("이메일과 비밀번호를 입력해주세요.")
    }

    // 실제 연동 시: 아래 코드 활성화
    /*
    const response = await this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.token) {
      this.token = response.token
      localStorage.setItem("auth_token", response.token)
    }

    return response
    */
  }

  async register(email: string, password: string, name: string) {
    // 현재: 모킹 처리
    await this.mockDelay(1000)

    if (email && password && name) {
      return {
        success: true,
        message: "회원가입이 완료되었습니다.",
      }
    } else {
      throw new Error("모든 필드를 입력해주세요.")
    }

    // 실제 연동 시: 아래 코드 활성화
    /*
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
    */
  }

  async logout() {
    // 현재: 모킹 처리
    this.token = null
    localStorage.removeItem("auth_token")

    // 실제 연동 시: 서버에 로그아웃 요청 전송
    /*
    return this.request("/auth/logout", { method: "POST" })
    */
  }

  // ============================================================================
  // 거래 제한 관련 API - Spring Boot 연동 시 수정 필요
  // ============================================================================

  async getTradingLimits() {
    // 현재: 모킹 처리
    await this.mockDelay(300)

    return {
      canBuyToday: !MOCK_DAILY_PURCHASE_USED, // 오늘 구매 가능 여부
      maxStockTypes: MOCK_MAX_STOCK_TYPES, // 최대 보유 가능한 주식 종류
      currentStockTypes: MOCK_HOLDINGS.length, // 현재 보유 중인 주식 종류 수
    }

    // 실제 연동 시: 아래 코드 활성화
    /*
    return this.request<{
      canBuyToday: boolean;
      maxStockTypes: number;
      currentStockTypes: number;
    }>("/trading/limits")
    */
  }

  // ============================================================================
  // 주식 관련 API - Spring Boot 연동 시 수정 필요
  // ============================================================================

  async getTodayStocks() {
    // 현재: 모킹 처리 - 고정된 5개 주식 반환
    await this.mockDelay(500)

    return MOCK_TODAY_STOCKS

    // 실제 연동 시: 아래 코드 활성화 (서버에서 매일 5개 주식을 선정해서 반환)
    /*
    return this.request<Stock[]>("/stocks/today")
    */
  }

  async getStockDetail(stockId: string) {
    // 현재: 모킹 처리
    await this.mockDelay(300)

    const stock = MOCK_TODAY_STOCKS.find((s) => s.id === stockId)
    if (!stock) {
      throw new Error("주식을 찾을 수 없습니다.")
    }
    return stock

    // 실제 연동 시: 아래 코드 활성화
    /*
    return this.request<Stock>(`/stocks/${stockId}`)
    */
  }

  // ============================================================================
  // 거래 관련 API - Spring Boot 연동 시 수정 필요
  // ============================================================================

  async buyStock(stockId: string, quantity: number) {
    // 현재: 모킹 처리
    await this.mockDelay(800)

    // 거래 제한 확인
    if (MOCK_DAILY_PURCHASE_USED) {
      throw new Error("오늘은 이미 구매하셨습니다. 내일 다시 시도해주세요.")
    }

    const stock = MOCK_TODAY_STOCKS.find((s) => s.id === stockId)
    if (!stock) {
      throw new Error("주식을 찾을 수 없습니다.")
    }

    const totalCost = stock.price * quantity
    if (totalCost > MOCK_BALANCE.krw) {
      throw new Error("잔고가 부족합니다.")
    }

    // 보유 종류 제한 확인 (새로운 주식인 경우)
    const existingHolding = MOCK_HOLDINGS.find((h) => h.id === stockId)
    if (!existingHolding && MOCK_HOLDINGS.length >= MOCK_MAX_STOCK_TYPES) {
      throw new Error(`최대 ${MOCK_MAX_STOCK_TYPES}개 종류의 주식만 보유할 수 있습니다.`)
    }

    // 모킹: 잔고 차감
    MOCK_BALANCE.krw -= totalCost

    // 모킹: 보유 주식에 추가 또는 수량 증가
    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity
      const newAvgPrice = (existingHolding.avgPrice * existingHolding.quantity + stock.price * quantity) / newQuantity
      existingHolding.quantity = newQuantity
      existingHolding.avgPrice = Math.round(newAvgPrice)
    } else {
      MOCK_HOLDINGS.push({
        ...stock,
        quantity,
        avgPrice: stock.price,
        purchaseDate: new Date().toISOString(),
      })
    }

    // 모킹: 거래 내역 추가
    MOCK_TRADE_HISTORY.unshift({
      id: Date.now().toString(),
      type: "BUY",
      stockId: stock.id,
      stockName: stock.name,
      stockCode: stock.code,
      quantity,
      price: stock.price,
      totalAmount: totalCost,
      timestamp: new Date().toISOString(),
    })

    // 모킹: 일일 구매 제한 활성화
    MOCK_DAILY_PURCHASE_USED = true

    return {
      success: true,
      message: "구매가 완료되었습니다.",
    }

    // 실제 연동 시: 아래 코드 활성화
    /*
    return this.request("/trading/buy", {
      method: "POST",
      body: JSON.stringify({ stockId, quantity }),
    })
    */
  }

  async sellStock(stockId: string, quantity: number) {
    // 현재: 모킹 처리
    await this.mockDelay(800)

    const holdingIndex = MOCK_HOLDINGS.findIndex((h) => h.id === stockId)
    if (holdingIndex === -1) {
      throw new Error("보유하지 않은 주식입니다.")
    }

    const holding = MOCK_HOLDINGS[holdingIndex]
    if (holding.quantity < quantity) {
      throw new Error("보유 수량이 부족합니다.")
    }

    // 모킹: 판매 금액 계산 및 잔고 증가
    const sellValue = holding.price * quantity
    MOCK_BALANCE.krw += sellValue

    // 모킹: 거래 내역 추가
    MOCK_TRADE_HISTORY.unshift({
      id: Date.now().toString(),
      type: "SELL",
      stockId: holding.id,
      stockName: holding.name,
      stockCode: holding.code,
      quantity,
      price: holding.price,
      totalAmount: sellValue,
      timestamp: new Date().toISOString(),
    })

    // 모킹: 보유 주식 수량 감소 또는 제거
    if (holding.quantity === quantity) {
      MOCK_HOLDINGS.splice(holdingIndex, 1)
    } else {
      holding.quantity -= quantity
    }

    return {
      success: true,
      message: "판매가 완료되었습니다.",
    }

    // 실제 연동 시: 아래 코드 활성화
    /*
    return this.request("/trading/sell", {
      method: "POST",
      body: JSON.stringify({ stockId, quantity }),
    })
    */
  }

  // ============================================================================
  // 거래 내역 관련 API - Spring Boot 연동 시 수정 필요
  // ============================================================================

  async getTradeHistory(page = 1, limit = 20) {
    // 현재: 모킹 처리
    await this.mockDelay(400)

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedHistory = MOCK_TRADE_HISTORY.slice(startIndex, endIndex)

    return {
      trades: paginatedHistory,
      totalCount: MOCK_TRADE_HISTORY.length,
      currentPage: page,
      totalPages: Math.ceil(MOCK_TRADE_HISTORY.length / limit),
      hasMore: endIndex < MOCK_TRADE_HISTORY.length,
    }

    // 실제 연동 시: 아래 코드 활성화
    /*
    return this.request<{
      trades: TradeHistory[];
      totalCount: number;
      currentPage: number;
      totalPages: number;
      hasMore: boolean;
    }>(`/trading/history?page=${page}&limit=${limit}`)
    */
  }

  // ============================================================================
  // 포트폴리오 관련 API - Spring Boot 연동 시 수정 필요
  // ============================================================================

  async getPortfolio() {
    // 현재: 모킹 처리
    await this.mockDelay(400)

    const totalValue = MOCK_HOLDINGS.reduce((sum, stock) => sum + stock.price * stock.quantity, 0)
    const totalCost = MOCK_HOLDINGS.reduce((sum, stock) => sum + stock.avgPrice * stock.quantity, 0)
    const totalReturn = totalValue - totalCost
    const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0

    return {
      totalValue,
      totalCost,
      totalReturn,
      totalReturnPercent,
      holdings: MOCK_HOLDINGS,
    }

    // 실제 연동 시: 아래 코드 활성화
    /*
    return this.request<Portfolio>("/portfolio")
    */
  }

  async getBalance() {
    // 현재: 모킹 처리
    await this.mockDelay(200)

    return MOCK_BALANCE

    // 실제 연동 시: 아래 코드 활성화
    /*
    return this.request<Balance>("/portfolio/balance")
    */
  }

  // ============================================================================
  // 사용자 관련 API - Spring Boot 연동 시 수정 필요
  // ============================================================================

  async getUserProfile() {
    // 현재: 모킹 처리
    await this.mockDelay(300)

    return MOCK_USER

    // 실제 연동 시: 아래 코드 활성화
    /*
    return this.request<User>("/user/profile")
    */
  }

  // ============================================================================
  // 실시간 가격 업데이트용 모킹 함수 - 실제 연동 시 WebSocket으로 대체
  // ============================================================================

  // 모킹: 주식 가격 랜덤 업데이트 (실제로는 WebSocket으로 받을 데이터)
  updateMockPrices() {
    MOCK_TODAY_STOCKS.forEach((stock) => {
      const changeAmount = (Math.random() - 0.5) * 2000
      const newPrice = Math.max(stock.price + changeAmount, 1000)
      const newChange = newPrice - (stock.price - stock.change)
      const newChangePercent = (newChange / (newPrice - newChange)) * 100

      stock.price = Math.round(newPrice)
      stock.change = Math.round(newChange)
      stock.changePercent = Number(newChangePercent.toFixed(2))
    })

    // 보유 주식 가격도 업데이트
    MOCK_HOLDINGS.forEach((holding) => {
      const mockStock = MOCK_TODAY_STOCKS.find((s) => s.id === holding.id)
      if (mockStock) {
        holding.price = mockStock.price
        holding.change = mockStock.change
        holding.changePercent = mockStock.changePercent
      }
    })
  }
}

export const apiService = new ApiService(API_BASE_URL)
