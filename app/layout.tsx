import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "../context/AppContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "투자 앱",
  description: "스마트한 투자의 시작",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
