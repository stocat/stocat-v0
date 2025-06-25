"use client"

import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useState } from "react"
import { Alert, RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View, Text } from "react-native"

import { useApp } from "../context/AppContext"
import { styles } from "../styles/styles"
import type { Stock, MarketType } from "../types"
import { StockCard } from "./StockCard"
import { MarketTabs } from "./MarketTabs"
import { BuyModal } from "./modals/BuyModal"
import { HoldingsModal } from "./modals/HoldingsModal"
import { TransactionHistory } from "./TransactionHistory"

export function MainScreen() {
  const { state, actions } = useApp()
  const [showBalance, setShowBalance] = useState(true)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [quantity, setQuantity] = useState("1")
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showHoldingsModal, setShowHoldingsModal] = useState(false)
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)

  const formatCurrency = (amount: number, market?: MarketType): string => {
    if (market === "domestic" || !market) {
      return new Intl.NumberFormat("ko-KR").format(amount) + "원"
    } else if (market === "crypto" && amount < 1) {
      return "$" + amount.toFixed(4)
    } else {
      return "$" + amount.toFixed(2)
    }
  }

  const getCurrentStocks = (): Stock[] => {
    switch (state.activeMarket) {
      case "domestic":
        return state.tradingSession.domesticStocks
      case "international":
        return state.tradingSession.internationalStocks
      case "crypto":
        return state.tradingSession.cryptoStocks
      default:
        return []
    }
  }

  const getMarketTitle = (): string => {
    switch (state.activeMarket) {
      case "domestic":
        return "국내주식"
      case "international":
        return "해외주식"
      case "crypto":
        return "코인"
      default:
        return ""
    }
  }

  const canPurchaseStock = (stock: Stock): boolean => {
    const isNewStock = !state.portfolio.holdings.find((h) => h.id === stock.id)
    return (
      state.tradingSession.tradingLimits.canBuyToday &&
      (!isNewStock ||
        state.tradingSession.tradingLimits.currentStockTypes < state.tradingSession.tradingLimits.maxStockTypes)
    )
  }

  const handleStockPress = (stock: Stock) => {
    if (!canPurchaseStock(stock)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert("구매 불가", "오늘 구매 완료했거나 최대 보유 종류를 초과했습니다.")
      return
    }
    setSelectedStock(stock)
    setQuantity("1")
    setShowBuyModal(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleBuyStock = async () => {
    if (!selectedStock) return
    try {
      await actions.buyStock(selectedStock.id, Number.parseInt(quantity))
      Alert.alert("성공", "구매가 완료되었습니다.")
      setShowBuyModal(false)
      setSelectedStock(null)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error: any) {
      Alert.alert("오류", error.message)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const handleTransactionHistory = () => {
    setShowHoldingsModal(false)
    setShowTransactionHistory(true)
  }

  // 모킹 거래내역 데이터
  const mockTransactions = state.portfolio.holdings.map((holding, index) => ({
    id: `transaction_${index}`,
    stock: holding,
    type: "BUY" as const,
    quantity: holding.quantity,
    price: holding.avgPrice,
    date: holding.purchaseDate,
    totalAmount: holding.avgPrice * holding.quantity,
  }))

  const currentStocks = getCurrentStocks()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={state.loading} onRefresh={actions.refreshData} tintColor="#ffffff" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>📈 투자</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={actions.logout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                <Ionicons name={showBalance ? "eye" : "eye-off"} size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance */}
          <View style={styles.balanceContainer}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>원화</Text>
              <Text style={styles.balanceAmount}>{showBalance ? formatCurrency(state.balance.krw) : "••••••"}</Text>
            </View>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>달러</Text>
              <Text style={styles.balanceAmount}>
                {showBalance ? `$${state.balance.usd.toLocaleString()}` : "••••"}
              </Text>
            </View>
          </View>

          {/* Portfolio - 수정된 부분 */}
          <View style={styles.portfolioCard}>
            <View style={styles.portfolioHeader}>
              <TouchableOpacity onPress={() => setShowHoldingsModal(true)}>
                <Text style={styles.viewHoldingsButton}>내 종목 보기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.portfolioContent}>
              <Text style={styles.portfolioValue}>
                {showBalance ? formatCurrency(state.portfolio.totalValue) : "••••••"}
              </Text>
              {state.portfolio.totalReturn !== 0 && (
                <View style={styles.returnContainer}>
                  <Text
                    style={[styles.returnAmount, { color: state.portfolio.totalReturn > 0 ? "#fca5a5" : "#93c5fd" }]}
                  >
                    {state.portfolio.totalReturn > 0 ? "+" : ""}
                    {formatCurrency(state.portfolio.totalReturn)}
                  </Text>
                  <Text
                    style={[styles.returnPercent, { color: state.portfolio.totalReturn > 0 ? "#fca5a5" : "#93c5fd" }]}
                  >
                    {state.portfolio.totalReturnPercent > 0 ? "+" : ""}
                    {state.portfolio.totalReturnPercent.toFixed(2)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Market Tabs */}
        <MarketTabs activeMarket={state.activeMarket} onMarketChange={actions.setActiveMarket} />

        {/* Stocks Section - 상태 표시 제거 */}
        <View style={styles.stocksSection}>
          <View style={styles.stocksHeader}>
            <Text style={styles.sectionTitle}>{getMarketTitle()}</Text>
          </View>

          {currentStocks.map((stock) => (
            <StockCard
              key={stock.id}
              stock={stock}
              onPress={() => handleStockPress(stock)}
              disabled={!canPurchaseStock(stock)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Buy Modal */}
      <BuyModal
        visible={showBuyModal}
        stock={selectedStock}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onBuy={handleBuyStock}
        onClose={() => setShowBuyModal(false)}
      />

      {/* Holdings Modal */}
      <HoldingsModal
        visible={showHoldingsModal}
        holdings={state.portfolio.holdings}
        maxStockTypes={state.tradingSession.tradingLimits.maxStockTypes}
        onClose={() => setShowHoldingsModal(false)}
        onTransactionHistory={handleTransactionHistory}
      />

      {/* Transaction History Modal */}
      {showTransactionHistory && (
        <View style={styles.modalOverlay}>
          <TransactionHistory transactions={mockTransactions} onClose={() => setShowTransactionHistory(false)} />
        </View>
      )}
    </SafeAreaView>
  )
}
