import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BOXALOO - Box Truck & Cargo Van Load Board",
  description:
    "Connect brokers with carriers for box truck and cargo van loads. Find freight, post loads, and grow your logistics business with BOXALOO.",
  keywords: "load board, box truck, cargo van, freight, logistics, shipping, trucking, BOXALOO",
  openGraph: {
    title: "BOXALOO - Box Truck & Cargo Van Load Board",
    description: "Connect brokers with carriers for box truck and cargo van loads.",
    type: "website",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
