import { Modal, ScrollView, View, Text, TouchableOpacity } from "react-native"
import type { HoldingStock, MarketType } from "../../types"
import { styles } from "../../styles/styles"

interface HoldingsModalProps {
  visible: boolean
  holdings: HoldingStock[]
  maxStockTypes: number
  onClose: () => void
  onTransactionHistory: () => void
}

export function HoldingsModal({ visible, holdings, maxStockTypes, onClose, onTransactionHistory }: HoldingsModalProps) {
  const formatCurrency = (amount: number, market: MarketType): string => {
    if (market === "domestic") {
      return new Intl.NumberFormat("ko-KR").format(amount) + "원"
    } else if (market === "crypto" && amount < 1) {
      return "$" + amount.toFixed(4)
    } else {
      return "$" + amount.toFixed(2)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
          >
            <Text style={styles.modalTitle}>
              내 종목 ({holdings.length}/{maxStockTypes})
            </Text>
            <TouchableOpacity onPress={onTransactionHistory}>
              <Text style={styles.viewHoldingsButton}>거래내역</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.holdingsList}>
            {holdings.length === 0 ? (
              <Text style={styles.emptyText}>보유 주식이 없습니다.</Text>
            ) : (
              holdings.map((stock) => {
                const currentValue = stock.price * stock.quantity
                const costValue = stock.avgPrice * stock.quantity
                const profit = currentValue - costValue
                const profitPercent = (profit / costValue) * 100

                return (
                  <View key={stock.id} style={styles.holdingItem}>
                    <View style={styles.holdingHeader}>
                      <Text style={styles.holdingName}>{stock.name}</Text>
                      <Text style={styles.holdingCode}>{stock.code}</Text>
                      <View style={styles.marketBadge}>
                        <Text style={styles.marketBadgeText}>
                          {stock.market === "domestic" ? "🇰🇷" : stock.market === "international" ? "🌍" : "₿"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.holdingDetails}>
                      <Text style={styles.holdingText}>보유: {stock.quantity}주</Text>
                      <Text style={styles.holdingText}>평균: {formatCurrency(stock.avgPrice, stock.market)}</Text>
                      <Text style={styles.holdingText}>현재: {formatCurrency(stock.price, stock.market)}</Text>
                      <Text style={[styles.holdingProfit, { color: profit > 0 ? "#fca5a5" : "#93c5fd" }]}>
                        {profit > 0 ? "+" : ""}
                        {formatCurrency(profit, stock.market)} ({profitPercent > 0 ? "+" : ""}
                        {profitPercent.toFixed(2)}%)
                      </Text>
                    </View>
                  </View>
                )
              })
            )}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
