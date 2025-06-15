// ============================================================================
// 타입 정의 - Spring Boot API 응답 형식에 맞게 수정 필요
// ============================================================================

// 주식 정보 타입 - 실제 API 응답에 맞게 필드 추가/수정 필요
export interface Stock {
  id: string
  name: string // 주식명 (예: "삼성전자")
  code: string // 주식 코드 (예: "005930")
  price: number // 현재가
  change: number // 전일 대비 변동금액
  changePercent: number // 전일 대비 변동률(%)
  volume?: number // 거래량 - 실제 연동 시 추가 가능
  marketCap?: number // 시가총액 - 실제 연동 시 추가 가능
}

// 보유 주식 타입 - 실제 API 응답에 맞게 필드 추가/수정 필요
export interface HoldingStock extends Stock {
  quantity: number // 보유 수량
  avgPrice: number // 평균 매수가
  purchaseDate: string // 최초 매수일 - 실제 연동 시 서버에서 받아올 값
}

// 잔고 정보 타입 - 실제 API 응답에 맞게 수정 필요
export interface Balance {
  krw: number // 원화 잔고
  usd: number // 달러 잔고 - 실제 서비스에서 사용하지 않으면 제거 가능
}

// 사용자 정보 타입 - 실제 API 응답에 맞게 필드 추가/수정 필요
export interface User {
  id: string
  email: string
  name: string
  createdAt: string // 가입일 - 실제 연동 시 서버에서 받아올 값
  // 실제 연동 시 추가 가능한 필드들:
  // phone?: string
  // profileImage?: string
  // isVerified?: boolean
}

// 포트폴리오 정보 타입 - 실제 API 응답에 맞게 수정 필요
export interface Portfolio {
  totalValue: number // 총 평가금액
  totalCost: number // 총 매수금액
  totalReturn: number // 총 수익금액
  totalReturnPercent: number // 총 수익률(%)
  holdings: HoldingStock[] // 보유 주식 목록
}

// 거래 제한 정보 타입 - 실제 API 응답에 맞게 수정 필요
export interface TradingLimits {
  canBuyToday: boolean // 오늘 구매 가능 여부
  maxStockTypes: number // 최대 보유 가능한 주식 종류
  currentStockTypes: number // 현재 보유 중인 주식 종류 수
  // 실제 연동 시 추가 가능한 필드들:
  // dailyBuyLimit?: number // 일일 구매 한도 금액
  // remainingBuyAmount?: number // 남은 구매 가능 금액
}

// 거래 세션 정보 타입 - 실제 API 응답에 맞게 수정 필요
export interface TradingSession {
  canBuyToday: boolean // 오늘 구매 가능 여부 - 실제 연동 시 서버에서 받아올 값
  todayStocks: Stock[] // 오늘의 추천 주식 목록
  lastUpdated: string // 마지막 업데이트 시간
  tradingLimits: TradingLimits // 거래 제한 정보
  // 실제 연동 시 추가 가능한 필드들:
  // marketStatus?: "OPEN" | "CLOSED" | "PRE_MARKET" | "AFTER_HOURS"
  // nextTradingDay?: string
}

// 거래 내역 타입 - 실제 API 응답에 맞게 수정 필요
export interface TradeHistory {
  id: string
  type: "BUY" | "SELL" // 거래 유형
  stockId: string
  stockName: string
  stockCode: string
  quantity: number // 거래 수량
  price: number // 거래 단가
  totalAmount: number // 총 거래 금액
  timestamp: string // 거래 시간
  // 실제 연동 시 추가 가능한 필드들:
  // orderId?: string
  // fee?: number // 수수료
  // tax?: number // 세금
}

// 거래 내역 응답 타입 - 실제 API 응답에 맞게 수정 필요
export interface TradeHistoryResponse {
  trades: TradeHistory[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasMore: boolean
}

// API 응답 공통 타입 - Spring Boot 응답 형식에 맞게 수정 필요
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  // 실제 Spring Boot 응답 형식 예시:
  // status: number
  // timestamp: string
}

// WebSocket 메시지 타입 - Spring Boot WebSocket 메시지 형식에 맞게 수정 필요
export interface WebSocketMessage {
  type: "STOCK_UPDATE" | "PORTFOLIO_UPDATE" | "BALANCE_UPDATE" | "MARKET_STATUS" | "TRADING_LIMITS_UPDATE"
  data: any
  timestamp: string
  // 실제 Spring Boot WebSocket 메시지 형식 예시:
  // userId?: string
  // channel?: string
}

// 거래 요청 타입 - Spring Boot API 요청 형식에 맞게 수정 필요
export interface TradeRequest {
  stockId: string
  quantity: number
  // 실제 연동 시 추가 가능한 필드들:
  // orderType?: "MARKET" | "LIMIT"
  // limitPrice?: number
}

// 거래 응답 타입 - Spring Boot API 응답 형식에 맞게 수정 필요
export interface TradeResponse {
  success: boolean
  orderId?: string
  message: string
  // 실제 연동 시 추가 가능한 필드들:
  // executedPrice?: number
  // executedQuantity?: number
  // executedAt?: string
}
