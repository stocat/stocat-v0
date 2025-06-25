import { ScrollView, View, Text, TouchableOpacity } from "react-native"
import type { HoldingStock, MarketType } from "../types"
import { styles } from "../styles/styles"

interface Transaction {
  id: string
  stock: HoldingStock
  type: "BUY" | "SELL"
  quantity: number
  price: number
  date: string
  totalAmount: number
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  onClose: () => void
}

export function TransactionHistory({ transactions, onClose }: TransactionHistoryProps) {
  const formatCurrency = (amount: number, market: MarketType): string => {
    if (market === "domestic") {
      return new Intl.NumberFormat("ko-KR").format(amount) + "원"
    } else if (market === "crypto" && amount < 1) {
      return "$" + amount.toFixed(4)
    } else {
      return "$" + amount.toFixed(2)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMarketIcon = (market: MarketType): string => {
    switch (market) {
      case "domestic":
        return "🇰🇷"
      case "international":
        return "🌍"
      case "crypto":
        return "₿"
      default:
        return ""
    }
  }

  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>거래내역</Text>
      <ScrollView style={styles.holdingsList}>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>거래내역이 없습니다.</Text>
        ) : (
          transactions.map((transaction) => (
            <View
              key={transaction.id}
              style={[
                styles.transactionItem,
                {
                  borderLeftColor: transaction.type === "BUY" ? "#3b82f6" : "#ef4444",
                },
              ]}
            >
              <View style={styles.transactionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.transactionName}>{transaction.stock.name}</Text>
                  <Text style={{ marginLeft: 8 }}>{getMarketIcon(transaction.stock.market)}</Text>
                </View>
                <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
              </View>
              <View style={styles.transactionDetails}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCode}>{transaction.stock.code}</Text>
                  <Text style={styles.transactionQuantity}>
                    {transaction.type === "BUY" ? "매수" : "매도"} {transaction.quantity}주 @{" "}
                    {formatCurrency(transaction.price, transaction.stock.market)}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: transaction.type === "BUY" ? "#93c5fd" : "#fca5a5" }]}>
                  {transaction.type === "BUY" ? "-" : "+"}
                  {formatCurrency(transaction.totalAmount, transaction.stock.market)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>닫기</Text>
      </TouchableOpacity>
    </View>
  )
}
