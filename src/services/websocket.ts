import type { WebSocketMessage } from "../types"
import { apiService } from "./api"

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private listeners: Map<string, ((data: any) => void)[]> = new Map()

  // 모킹용 인터벌 - 실제 연동 시 제거 필요
  private mockInterval: NodeJS.Timeout | null = null

  constructor(url: string) {
    this.url = url
  }

  connect(token: string) {
    console.log("WebSocket 연결 시뮬레이션 시작 (모킹)")

    // 현재: 모킹 처리 - 3초마다 주식 가격 업데이트 시뮬레이션
    this.mockInterval = setInterval(() => {
      // 주식 가격 업데이트 시뮬레이션
      apiService.updateMockPrices()

      // 구독자들에게 업데이트 알림
      this.simulateStockUpdate()
    }, 3000)
  }

  // 모킹: 주식 업데이트 시뮬레이션 - 실제 연동 시 제거 필요
  private async simulateStockUpdate() {
    try {
      // 모든 마켓의 주식 가격 업데이트 시뮬레이션
      const allStocks = await apiService.getAllStocks()

      this.handleMessage({
        type: "STOCK_UPDATE",
        data: allStocks,
        timestamp: new Date().toISOString(),
      })

      // 포트폴리오 업데이트 시뮬레이션
      const portfolio = await apiService.getPortfolio()
      this.handleMessage({
        type: "PORTFOLIO_UPDATE",
        data: portfolio.holdings,
        timestamp: new Date().toISOString(),
      })

      // 잔고 업데이트 시뮬레이션
      const balance = await apiService.getBalance()
      this.handleMessage({
        type: "BALANCE_UPDATE",
        data: balance,
        timestamp: new Date().toISOString(),
      })

      // 거래 제한 업데이트 시뮬레이션
      const limits = await apiService.getTradingLimits()
      this.handleMessage({
        type: "TRADING_LIMITS_UPDATE",
        data: limits,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("모킹 데이터 업데이트 실패:", error)
    }
  }

  // 실제 연동 시: 재연결 로직 활성화
  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`WebSocket 재연결 시도... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect(token)
      }, this.reconnectInterval)
    } else {
      console.error("WebSocket 재연결 최대 시도 횟수 초과")
    }
  }

  // WebSocket 메시지 처리 - 실제 연동 시 서버 메시지 형식에 맞게 수정
  private handleMessage(message: WebSocketMessage) {
    console.log("WebSocket 메시지 수신:", message.type, message.data)

    const listeners = this.listeners.get(message.type) || []
    listeners.forEach((listener) => listener(message.data))
  }

  // 메시지 타입별 구독 - 실제 연동 시 그대로 사용 가능
  subscribe(messageType: string, callback: (data: any) => void) {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, [])
    }
    this.listeners.get(messageType)!.push(callback)
    console.log(`WebSocket 구독 등록: ${messageType}`)
  }

  // 구독 해제 - 실제 연동 시 그대로 사용 가능
  unsubscribe(messageType: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(messageType) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
      console.log(`WebSocket 구독 해제: ${messageType}`)
    }
  }

  // 연결 종료 - 실제 연동 시 수정 필요
  disconnect() {
    console.log("WebSocket 연결 종료")

    // 모킹: 인터벌 정리
    if (this.mockInterval) {
      clearInterval(this.mockInterval)
      this.mockInterval = null
    }

    this.listeners.clear()
  }

  // 서버로 메시지 전송 - 실제 연동 시 활성화
  send(message: any) {
    console.log("WebSocket 메시지 전송 시뮬레이션:", message)
  }

  // 연결 상태 확인
  isConnected(): boolean {
    // 모킹: 항상 연결된 것으로 처리
    return this.mockInterval !== null
  }
}

// 실제 연동 시: 환경변수에서 WebSocket URL 가져오기
const WS_URL = "ws://localhost:8080/ws" // 실제 서버 주소로 변경 필요
export const webSocketService = new WebSocketService(WS_URL)
