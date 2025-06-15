"use client"

import { useState } from "react"
import { apiService } from "../services/api"
import type { TradeHistory, TradeHistoryResponse } from "../types"

export function useTradeHistory() {
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [loading, setLoading] = useState(false)
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

  const refreshHistory = () => {
    loadTradeHistory(1)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadTradeHistory(currentPage + 1, true)
    }
  }

  return {
    tradeHistory,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    loadTradeHistory,
    refreshHistory,
    loadMore,
  }
}
