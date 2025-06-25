"use client"

import { useState } from "react"
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native"
import { useApp } from "../context/AppContext"
import { styles } from "../styles/styles"

export function AuthScreen() {
  const { actions, state } = useApp()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await actions.login(email, password)
      } else {
        await actions.register(email, password, name)
      }
    } catch (error) {
      // 에러는 Context에서 처리됨
    }
  }

  return (
    <SafeAreaView style={styles.authContainer}>
      <ScrollView contentContainerStyle={styles.authScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.authContent}>
          <Text style={styles.authTitle}>📈 투자</Text>
          <Text style={styles.authSubtitle}>글로벌 투자의 시작</Text>

          {state.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="이름"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.authButton, state.loading && styles.authButtonDisabled]}
              onPress={handleSubmit}
              disabled={state.loading}
            >
              <Text style={styles.authButtonText}>{state.loading ? "처리중..." : isLogin ? "로그인" : "회원가입"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
