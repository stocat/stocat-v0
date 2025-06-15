"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { apiService } from "../../services/api"
import LoadingSpinner from "../../components/LoadingSpinner"
import ErrorMessage from "../../components/ErrorMessage"
import type { TradeHistory, TradeHistoryResponse } from "../../types"

interface TradeHistoryPageProps {
  onBack: () => void
}

export default function TradeHistoryPage({ onBack }: TradeHistoryPageProps) {
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const loadTradeHistory = async (page = 1, append = false) => {
    try {
      setLoading(true)
      setError(null)

      const response: TradeHistoryResponse = await apiService.getTradeHistory(page, 20)

      if (append) {
        setTradeHistory((prev) => [...prev, ...response.trades])
      } else {
        setTradeHistory(response.trades)
      }

      setCurrentPage(response.currentPage)
      setHasMore(response.hasMore)
      setTotalCount(response.totalCount)
    } catch (err: any) {
      setError(err.message || "거래 내역을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTradeHistory(1)
  }, [])

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadTradeHistory(currentPage + 1, true)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num)
  }

  const formatCurrency = (num: number) => {
    return `${formatNumber(num)}원`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-6 shadow-lg border-b border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-300 hover:text-white p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">거래 내역</h1>
        </div>

        {totalCount > 0 && (
          <div className="text-sm text-gray-400">
            총 <span className="text-white font-semibold">{totalCount}</span>건의 거래 내역
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onRetry={() => loadTradeHistory(1)} />
          </div>
        )}

        {loading && tradeHistory.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : tradeHistory.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400 text-lg">거래 내역이 없습니다.</p>
              <p className="text-gray-500 text-sm mt-2">첫 번째 주식을 구매해보세요!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tradeHistory.map((trade) => (
              <Card key={trade.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={trade.type === "BUY" ? "default" : "destructive"}
                        className={`${
                          trade.type === "BUY" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {trade.type === "BUY" ? (
                          <>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            매수
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 mr-1" />
                            매도
                          </>
                        )}
                      </Badge>
                      <div>
                        <h3 className="font-semibold text-white">{trade.stockName}</h3>
                        <p className="text-xs text-gray-400">{trade.stockCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{formatCurrency(trade.totalAmount)}</p>
                      <p className="text-xs text-gray-400">{formatDate(trade.timestamp)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">수량</p>
                      <p className="text-white font-medium">{trade.quantity}주</p>
                    </div>
                    <div>
                      <p className="text-gray-400">단가</p>
                      <p className="text-white font-medium">{formatCurrency(trade.price)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">총액</p>
                      <p className="text-white font-medium">{formatCurrency(trade.totalAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">로딩중...</span>
                    </>
                  ) : (
                    "더 보기"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
