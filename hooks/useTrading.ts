import { useApp } from "../context/AppContext"

export function useTrading() {
  const { state, actions } = useApp()

  return {
    balance: state.balance,
    portfolio: state.portfolio,
    tradingSession: state.tradingSession,
    loading: state.loading,
    error: state.error,
    buyStock: actions.buyStock,
    sellStock: actions.sellStock,
    refreshData: actions.refreshData,
  }
}
