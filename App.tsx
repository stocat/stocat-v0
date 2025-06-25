"use client"

import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { StatusBar } from "expo-status-bar"
import { View } from "react-native"
import { Text, TouchableOpacity } from "react-native"

import { AppProvider, useApp } from "./src/context/AppContext"
import { AuthScreen } from "./src/components/AuthScreen"
import { MainScreen } from "./src/components/MainScreen"
import { styles } from "./src/styles/styles"
import type { Stock, MarketType } from "./src/types"

// 주식 카드 컴포넌트
function StockCard({ stock, onPress, disabled }: { stock: Stock; onPress: () => void; disabled?: boolean }) {
  const isPositive = stock.changePercent > 0
  const isNegative = stock.changePercent < 0
  const borderColor = isPositive ? "#ef4444" : isNegative ? "#3b82f6" : "#6b7280"
  const textColor = isPositive ? "#fca5a5" : isNegative ? "#93c5fd" : "#d1d5db"

  const formatCurrency = (amount: number, market: MarketType): string => {
    if (market === "domestic") {
      return new Intl.NumberFormat("ko-KR").format(amount) + "원"
    } else if (market === "crypto" && amount < 1) {
      return "$" + amount.toFixed(4)
    } else {
      return "$" + amount.toFixed(2)
    }
  }

  const formatChange = (change: number, market: MarketType): string => {
    const prefix = change > 0 ? "+" : ""
    if (market === "domestic") {
      return prefix + new Intl.NumberFormat("ko-KR").format(change) + "원"
    } else if (market === "crypto" && Math.abs(change) < 1) {
      return prefix + change.toFixed(4)
    } else {
      return prefix + change.toFixed(2)
    }
  }

  return (
    <TouchableOpacity
      style={[styles.stockCard, { borderLeftColor: borderColor }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.stockContent}>
        <View style={styles.stockLeft}>
          <View style={styles.stockHeader}>
            <Text style={styles.stockName}>{stock.name}</Text>
            <Text style={styles.stockCode}>{stock.code}</Text>
          </View>
          <Text style={styles.stockPrice}>{formatCurrency(stock.price, stock.market)}</Text>
        </View>
        <View style={styles.stockRight}>
          <Text style={[styles.stockPercent, { color: textColor }]}>
            {stock.changePercent > 0 ? "+" : ""}
            {stock.changePercent}%
          </Text>
          <View style={styles.stockChangeContainer}>
            {stock.change !== 0 && (
              <Ionicons
                name={stock.change > 0 ? "trending-up" : "trending-down"}
                size={12}
                color={textColor}
                style={styles.stockIcon}
              />
            )}
            <Text style={[styles.stockChange, { color: textColor }]}>{formatChange(stock.change, stock.market)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// 마켓 탭 컴포넌트
function MarketTabs({
  activeMarket,
  onMarketChange,
}: { activeMarket: MarketType; onMarketChange: (market: MarketType) => void }) {
  const tabs = [
    { key: "domestic" as MarketType, title: "국내주식", icon: "🇰🇷" },
    { key: "international" as MarketType, title: "해외주식", icon: "🌍" },
    { key: "crypto" as MarketType, title: "코인", icon: "₿" },
  ]

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeMarket === tab.key && styles.activeTab]}
          onPress={() => {
            onMarketChange(tab.key)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabText, activeMarket === tab.key && styles.activeTabText]}>{tab.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function AppContent() {
  const { state } = useApp()
  return state.isAuthenticated ? <MainScreen /> : <AuthScreen />
}

export default function App() {
  return (
    <AppProvider>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#1f2937" />
        <AppContent />
      </View>
    </AppProvider>
  )
}
        