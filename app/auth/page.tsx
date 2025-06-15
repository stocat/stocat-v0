"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import LoadingSpinner from "../../components/LoadingSpinner"
import ErrorMessage from "../../components/ErrorMessage"

export default function AuthPage() {
  const { login, register, loading, error } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await register(formData.email, formData.password, formData.name)
      }
    } catch (error) {
      // 에러는 Context에서 처리됨
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">투자</h1>
          <p className="text-gray-400">스마트한 투자의 시작</p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center text-white">{isLogin ? "로그인" : "회원가입"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    이름
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  비밀번호
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">
                    비밀번호 확인
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? <LoadingSpinner /> : isLogin ? "로그인" : "회원가입"}
              </Button>
            </form>

            <div className="relative">
              <Separator className="bg-gray-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-gray-800 px-2 text-xs text-gray-400">또는</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                Google로 계속하기
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                카카오로 계속하기
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                className="text-sm text-gray-400 hover:text-white"
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
              >
                {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
              </Button>
            </div>

            {isLogin && (
              <div className="text-center">
                <Button variant="ghost" className="text-xs text-gray-500 hover:text-gray-400" disabled={loading}>
                  비밀번호를 잊으셨나요?
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-gray-500">
          <p>
            계속 진행하면 <span className="text-blue-400">이용약관</span> 및{" "}
            <span className="text-blue-400">개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
