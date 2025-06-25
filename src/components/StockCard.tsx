import { Ionicons } from "@expo/vector-icons"
import { TouchableOpacity, View, Text } from "react-native"
import type { Stock, MarketType } from "../types"
import { styles } from "../styles/styles"

interface StockCardProps {
  stock: Stock
  onPress: () => void
  disabled?: boolean
}

export function StockCard({ stock, onPress, disabled }: StockCardProps) {
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
