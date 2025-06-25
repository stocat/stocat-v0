import * as Haptics from "expo-haptics"
import { TouchableOpacity, View, Text } from "react-native"
import type { MarketType } from "../types"
import { styles } from "../styles/styles"

interface MarketTabsProps {
  activeMarket: MarketType
  onMarketChange: (market: MarketType) => void
}

export function MarketTabs({ activeMarket, onMarketChange }: MarketTabsProps) {
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
