// ============================================================================
// WebSocket 서비스 - Spring Boot WebSocket 연동 시 수정 필요
// ============================================================================

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
    // 현재: 모킹 처리 - 실제 WebSocket 대신 주기적으로 데이터 업데이트
    console.log("WebSocket 연결 시뮬레이션 시작 (모킹)")

    // 모킹: 3초마다 주식 가격 업데이트 시뮬레이션
    this.mockInterval = setInterval(() => {
      // 주식 가격 업데이트 시뮬레이션
      apiService.updateMockPrices()

      // 구독자들에게 업데이트 알림
      this.simulateStockUpdate()
    }, 3000)

    // 실제 연동 시: 아래 코드 활성화
    /*
    try {
      // Spring Boot WebSocket 엔드포인트에 연결
      // 예: ws://localhost:8080/ws?token=jwt_token
      this.ws = new WebSocket(`${this.url}?token=${token}`)

      this.ws.onopen = () => {
        console.log("WebSocket 연결 성공")
        this.reconnectAttempts = 0
        
        // 연결 후 구독할 채널 설정
        this.send({
          type: "SUBSCRIBE",
          channels: ["STOCK_PRICES", "PORTFOLIO_UPDATES", "BALANCE_UPDATES"]
        })
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("WebSocket 메시지 파싱 실패:", error)
        }
      }

      this.ws.onclose = (event) => {
        console.log("WebSocket 연결 종료:", event.code, event.reason)
        this.attemptReconnect(token)
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket 오류:", error)
      }
    } catch (error) {
      console.error("WebSocket 연결 실패:", error)
    }
    */
  }

  // 모킹: 주식 업데이트 시뮬레이션 - 실제 연동 시 제거 필요
  private simulateStockUpdate() {
    // 오늘의 주식 가격 업데이트 시뮬레이션
    apiService.getTodayStocks().then((stocks) => {
      this.handleMessage({
        type: "STOCK_UPDATE",
        data: stocks,
        timestamp: new Date().toISOString(),
      })
    })

    // 포트폴리오 업데이트 시뮬레이션
    apiService.getPortfolio().then((portfolio) => {
      this.handleMessage({
        type: "PORTFOLIO_UPDATE",
        data: portfolio.holdings,
        timestamp: new Date().toISOString(),
      })
    })

    // 잔고 업데이트 시뮬레이션
    apiService.getBalance().then((balance) => {
      this.handleMessage({
        type: "BALANCE_UPDATE",
        data: balance,
        timestamp: new Date().toISOString(),
      })
    })
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

  // WebSocket 메시지 처리 - 실제 연동 시 Spring Boot에서 오는 메시지 형식에 맞게 수정
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

    // 실제 연동 시: 아래 코드 활성화
    /*
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    */

    this.listeners.clear()
  }

  // 서버로 메시지 전송 - 실제 연동 시 활성화
  send(message: any) {
    // 현재: 모킹 처리 (실제로는 전송하지 않음)
    console.log("WebSocket 메시지 전송 시뮬레이션:", message)

    // 실제 연동 시: 아래 코드 활성화
    /*
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket이 연결되지 않았습니다.")
    }
    */
  }
}

// 실제 연동 시: 환경변수에서 WebSocket URL 가져오기
// 예: ws://localhost:8080/ws 또는 wss://your-domain.com/ws
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws"
export const webSocketService = new WebSocketService(WS_URL)
