"use client"

import { useApp } from "../context/AppContext"

export function useAuth() {
  const { state, actions } = useApp()

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login: actions.login,
    logout: actions.logout,
    register: actions.register,
  }
}
