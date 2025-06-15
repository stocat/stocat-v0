"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, ChevronRight, Eye, EyeOff, AlertCircle, History } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { useTrading } from "../hooks/useTrading"
import AuthPage from "./auth/page"
import TradeHistoryPage from "./history/page"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import type { Stock, HoldingStock } from "../types"

export default function StockTradingApp() {
  const { isAuthenticated } = useAuth()
  const { balance, portfolio, tradingSession, loading, error, buyStock, sellStock, refreshData } = useTrading()

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showHoldings, setShowHoldings] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  if (!isAuthenticated) {
    return <AuthPage />
  }

  if (showHistory) {
    return <TradeHistoryPage onBack={() => setShowHistory(false)} />
  }

  const handleBuy = async () => {
    if (!selectedStock) return

    try {
      await buyStock(selectedStock.id, quantity)
      setSelectedStock(null)
      setQuantity(1)
    } catch (error) {
      console.error("Buy stock error:", error)
    }
  }

  const handleSell = async (stock: HoldingStock, sellQuantity: number) => {
    try {
      await sellStock(stock.id, sellQuantity)
      setShowHoldings(false)
    } catch (error) {
      console.error("Sell stock error:", error)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num)
  }

  const formatCurrency = (num: number, currency: "KRW" | "USD" = "KRW") => {
    if (currency === "USD") {
      return `$${formatNumber(num)}`
    }
    return `${formatNumber(num)}원`
  }

  // 구매 가능 여부 체크 함수
  const canPurchaseStock = (stock: Stock, qty: number) => {
    const totalCost = stock.price * qty
    const { tradingLimits } = tradingSession

    // 잔고 부족
    if (totalCost > balance.krw) return { canPurchase: false, reason: "잔고 부족" }

    // 오늘 구매 제한
    if (!tradingLimits.canBuyToday) return { canPurchase: false, reason: "오늘 구매 완료" }

    // 보유 종류 제한 (새로운 주식인 경우)
    const isNewStock = !portfolio.holdings.find((h) => h.id === stock.id)
    if (isNewStock && tradingLimits.currentStockTypes >= tradingLimits.maxStockTypes) {
      return { canPurchase: false, reason: `최대 ${tradingLimits.maxStockTypes}개 종류만 보유 가능` }
    }

    return { canPurchase: true, reason: "" }
  }

  // 주식 상승/하락에 따른 배경색 결정
  const getStockBackgroundColor = (changePercent: number) => {
    if (changePercent > 0) {
      return "bg-red-900/30 border-red-700/50" // 상승: 빨강
    } else if (changePercent < 0) {
      return "bg-blue-900/30 border-blue-700/50" // 하락: 파랑
    } else {
      return "bg-gray-800 border-gray-700" // 보합: 기본
    }
  }

  if (loading && !portfolio.holdings.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {error && (
        <div className="p-4">
          <ErrorMessage message={error} onRetry={refreshData} />
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 px-4 py-6 shadow-lg border-b border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">투자</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="text-gray-300 hover:text-white"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-300 hover:text-white"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">원화</p>
            <p className="font-bold text-lg text-white">{showBalance ? formatCurrency(balance.krw) : "••••••"}</p>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">달러</p>
            <p className="font-bold text-lg text-white">{showBalance ? formatCurrency(balance.usd, "USD") : "••••"}</p>
          </div>
        </div>

        {/* Total Return */}
        <Card className="bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">전체 수익률</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-400 p-0 h-auto hover:text-blue-300"
                onClick={() => setShowHoldings(true)}
              >
                내 주식 보기 <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-white">
                {showBalance ? formatCurrency(portfolio.totalValue) : "••••••"}
              </span>
              {portfolio.totalReturn !== 0 && (
                <div className="text-right">
                  <Badge
                    variant={portfolio.totalReturn > 0 ? "default" : "destructive"}
                    className={`text-xs ${portfolio.totalReturn > 0 ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    {portfolio.totalReturn > 0 ? "+" : ""}
                    {formatCurrency(portfolio.totalReturn)}
                  </Badge>
                  <p className={`text-xs mt-1 ${portfolio.totalReturn > 0 ? "text-red-400" : "text-blue-400"}`}>
                    {portfolio.totalReturnPercent > 0 ? "+" : ""}
                    {portfolio.totalReturnPercent.toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Stocks */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">오늘의 주식</h2>
          <div className="flex items-center gap-2">
            {!tradingSession.tradingLimits.canBuyToday && (
              <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                오늘 구매 완료
              </Badge>
            )}
            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
              {tradingSession.tradingLimits.currentStockTypes}/{tradingSession.tradingLimits.maxStockTypes} 종류 보유
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {tradingSession.todayStocks.map((stock) => {
            const purchaseCheck = canPurchaseStock(stock, quantity)

            return (
              <Dialog key={stock.id}>
                <DialogTrigger asChild>
                  <Card
                    className={`cursor-pointer transition-all hover:opacity-80 ${getStockBackgroundColor(stock.changePercent)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">{stock.name}</h3>
                            <span className="text-xs text-gray-400">{stock.code}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            {/* 왼쪽: 가격 */}
                            <div>
                              <span className="font-bold text-xl text-white">{formatCurrency(stock.price)}</span>
                            </div>
                            {/* 오른쪽: 퍼센트(위), 변동금액(아래) */}
                            <div className="text-right">
                              {/* 퍼센트 - 위쪽, 크게 */}
                              <div
                                className={`text-lg font-bold mb-1 ${
                                  stock.changePercent > 0
                                    ? "text-red-300"
                                    : stock.changePercent < 0
                                      ? "text-blue-300"
                                      : "text-gray-300"
                                }`}
                              >
                                {stock.changePercent > 0 ? "+" : ""}
                                {stock.changePercent}%
                              </div>
                              {/* 변동금액 - 아래쪽 */}
                              <div
                                className={`flex items-center justify-end gap-1 ${stock.change > 0 ? "text-red-400" : stock.change < 0 ? "text-blue-400" : "text-gray-400"}`}
                              >
                                {stock.change > 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : stock.change < 0 ? (
                                  <TrendingDown className="w-3 h-3" />
                                ) : null}
                                <span className="text-sm font-medium">
                                  {stock.change > 0 ? "+" : ""}
                                  {formatCurrency(stock.change)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">{stock.name} 구매</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{formatCurrency(stock.price)}</p>
                      <p
                        className={`text-sm mt-1 ${
                          stock.changePercent > 0
                            ? "text-red-400"
                            : stock.changePercent < 0
                              ? "text-blue-400"
                              : "text-gray-400"
                        }`}
                      >
                        {stock.change > 0 ? "+" : ""}
                        {formatCurrency(stock.change)} ({stock.changePercent > 0 ? "+" : ""}
                        {stock.changePercent}%)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-gray-300">
                        수량
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">총 구매금액</span>
                        <span className="font-semibold text-white">{formatCurrency(stock.price * quantity)}</span>
                      </div>
                    </div>

                    {/* 구매 제한 안내 */}
                    {!purchaseCheck.canPurchase && (
                      <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span className="text-yellow-300 text-sm">{purchaseCheck.reason}</span>
                      </div>
                    )}

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                      onClick={() => {
                        setSelectedStock(stock)
                        handleBuy()
                      }}
                      disabled={loading || !purchaseCheck.canPurchase}
                    >
                      {loading ? "처리중..." : !purchaseCheck.canPurchase ? purchaseCheck.reason : "구매하기"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>
      </div>

      {/* Holdings Modal */}
      <Dialog open={showHoldings} onOpenChange={setShowHoldings}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              보유 주식 ({portfolio.holdings.length}/{tradingSession.tradingLimits.maxStockTypes})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {portfolio.holdings.length === 0 ? (
              <p className="text-center text-gray-400 py-8">보유 주식이 없습니다.</p>
            ) : (
              portfolio.holdings.map((stock) => {
                const currentValue = stock.price * stock.quantity
                const costValue = stock.avgPrice * stock.quantity
                const profit = currentValue - costValue
                const profitPercent = (profit / costValue) * 100

                return (
                  <Card key={stock.id} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{stock.name}</h3>
                          <p className="text-xs text-gray-400">{stock.code}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              판매
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
                            <DialogHeader>
                              <DialogTitle className="text-white">{stock.name} 판매</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="text-center">
                                <p className="text-lg font-bold text-white">{formatCurrency(stock.price)}</p>
                                <p className="text-sm text-gray-400">보유: {stock.quantity}주</p>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="sellQuantity" className="text-gray-300">
                                  판매 수량
                                </Label>
                                <Input
                                  id="sellQuantity"
                                  type="number"
                                  min="1"
                                  max={stock.quantity}
                                  defaultValue="1"
                                  onChange={(e) => setQuantity(Number(e.target.value))}
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>

                              <Button
                                className="w-full bg-red-600 hover:bg-red-700"
                                onClick={() => handleSell(stock, quantity)}
                                disabled={loading}
                              >
                                {loading ? "처리중..." : "판매하기"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">보유수량</span>
                          <span className="text-white">{stock.quantity}주</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">평균단가</span>
                          <span className="text-white">{formatCurrency(stock.avgPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">현재가</span>
                          <span className="text-white">{formatCurrency(stock.price)}</span>
                        </div>
                        <Separator className="bg-gray-600" />
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-300">평가금액</span>
                          <span className="text-white">{formatCurrency(currentValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">수익률</span>
                          <div className="text-right">
                            <span
                              className={profit > 0 ? "text-red-400" : profit < 0 ? "text-blue-400" : "text-gray-400"}
                            >
                              {profit > 0 ? "+" : ""}
                              {formatCurrency(profit)}
                            </span>
                            <p
                              className={`text-xs mt-1 font-bold ${
                                profit > 0 ? "text-red-400" : profit < 0 ? "text-blue-400" : "text-gray-400"
                              }`}
                            >
                              {profitPercent > 0 ? "+" : ""}
                              {profitPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
