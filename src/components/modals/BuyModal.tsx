import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native"
import type { Stock, MarketType } from "../../types"
import { styles } from "../../styles/styles"

interface BuyModalProps {
  visible: boolean
  stock: Stock | null
  quantity: string
  onQuantityChange: (quantity: string) => void
  onBuy: () => void
  onClose: () => void
}

export function BuyModal({ visible, stock, quantity, onQuantityChange, onBuy, onClose }: BuyModalProps) {
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
          <Text style={styles.modalTitle}>{stock?.name} 구매</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.modalPrice}>{stock && formatCurrency(stock.price, stock.market)}</Text>
            {stock && stock.changePercent !== 0 && (
              <Text style={[styles.modalPriceChange, { color: stock.changePercent > 0 ? "#fca5a5" : "#93c5fd" }]}>
                {stock.changePercent > 0 ? "+" : ""}
                {stock.changePercent}%
              </Text>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>수량</Text>
            <TextInput
              style={styles.modalInput}
              value={quantity}
              onChangeText={onQuantityChange}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Text style={styles.totalAmount}>
            총 구매금액: {stock && formatCurrency(stock.price * Number.parseInt(quantity || "1"), stock.market)}
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyButton} onPress={onBuy}>
              <Text style={styles.buyButtonText}>구매</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
