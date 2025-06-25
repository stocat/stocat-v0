export type MarketType = "domestic" | "international" | "crypto"

export interface Stock {
  id: string
  name: string
  code: string
  price: number
  change: number
  changePercent: number
  market: MarketType
}

export interface HoldingStock extends Stock {
  quantity: number
  avgPrice: number
  purchaseDate: string
}

export interface Balance {
  krw: number
  usd: number
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Portfolio {
  totalValue: number
  totalCost: number
  totalReturn: number
  totalReturnPercent: number
  holdings: HoldingStock[]
}

export interface TradingLimits {
  canBuyToday: boolean
  maxStockTypes: number
  currentStockTypes: number
}

export interface TradingSession {
  canBuyToday: boolean
  domesticStocks: Stock[]
  internationalStocks: Stock[]
  cryptoStocks: Stock[]
  lastUpdated: string
  tradingLimits: TradingLimits
}

// WebSocket 메시지 타입
export interface WebSocketMessage {
  type: "STOCK_UPDATE" | "PORTFOLIO_UPDATE" | "BALANCE_UPDATE" | "TRADING_LIMITS_UPDATE"
  data: any
  timestamp: string
  market?: MarketType
}

// WebSocket 연결 상태
export interface WebSocketState {
  connected: boolean
  reconnectAttempts: number
  lastError: string | null
}
