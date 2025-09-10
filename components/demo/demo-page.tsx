"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Truck, Users, Shield, Copy, CheckCircle, ArrowRight, Play } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface DemoAccount {
  role: "admin" | "broker" | "carrier" | "dispatcher"
  email: string
  password: string
  name: string
  companyName: string
  description: string
  features: string[]
  icon: React.ReactNode
  color: string
}

export function DemoPage() {
  const [selectedAccount, setSelectedAccount] = useState<DemoAccount | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const demoAccounts: DemoAccount[] = [
    {
      role: "admin",
      email: "admin@boxaloo.com",
      password: "admin123",
      name: "Admin User",
      companyName: "BOX Platform",
      description: "Full platform administration and oversight",
      features: ["User management", "Load monitoring", "System analytics", "Platform settings"],
      icon: <Shield className="h-6 w-6" />,
      color: "bg-red-500",
    },
    {
      role: "broker",
      email: "broker@example.com",
      password: "broker123",
      name: "John Smith",
      companyName: "Swift Logistics LLC",
      description: "Post loads and manage carrier relationships",
      features: ["Post new loads", "Manage active loads", "Carrier communication", "Performance analytics"],
      icon: <Building2 className="h-6 w-6" />,
      color: "bg-blue-500",
    },
    {
      role: "carrier",
      email: "carrier@example.com",
      password: "carrier123",
      name: "Mike Johnson",
      companyName: "Johnson Trucking",
      description: "Find and book profitable loads",
      features: ["Browse available loads", "Advanced search filters", "Instant load booking", "Route optimization"],
      icon: <Truck className="h-6 w-6" />,
      color: "bg-green-500",
    },
    {
      role: "dispatcher",
      email: "dispatcher@example.com",
      password: "dispatcher123",
      name: "Sarah Wilson",
      companyName: "Fleet Management Co",
      description: "Manage fleet operations and driver assignments",
      features: ["Fleet management", "Driver communication", "Load assignments", "Performance tracking"],
      icon: <Users className="h-6 w-6" />,
      color: "bg-purple-500",
    },
  ]

  const handleCopyCredentials = async (field: "email" | "password", value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleDemoLogin = async (account: DemoAccount) => {
    setIsLoggingIn(true)
    try {
      const success = await login(account.email, account.password)
      if (success) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Demo login failed:", error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Play className="h-4 w-4 mr-2" />
            Interactive Demo
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Experience BOX Load Board</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Try our platform with pre-configured demo accounts. No signup required - just click and explore all features
            instantly.
          </p>
        </div>

        {/* Demo Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {demoAccounts.map((account) => (
            <Card
              key={account.role}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedAccount?.role === account.role ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedAccount(account)}
            >
              <CardHeader className="text-center">
                <div
                  className={`w-12 h-12 ${account.color} rounded-lg flex items-center justify-center text-white mx-auto mb-3`}
                >
                  {account.icon}
                </div>
                <CardTitle className="capitalize">{account.role}</CardTitle>
                <CardDescription>{account.companyName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{account.description}</p>
                <div className="space-y-2">
                  {account.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Account Details */}
        {selectedAccount && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 ${selectedAccount.color} rounded-lg flex items-center justify-center text-white`}
                >
                  {selectedAccount.icon}
                </div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="capitalize">{selectedAccount.role} Demo</span>
                    <Badge variant="outline">{selectedAccount.name}</Badge>
                  </CardTitle>
                  <CardDescription>{selectedAccount.companyName}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Demo Credentials</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="demo-email">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="demo-email" value={selectedAccount.email} readOnly className="bg-white" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCredentials("email", selectedAccount.email)}
                      >
                        {copiedField === "email" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="demo-password">Password</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="demo-password" value={selectedAccount.password} readOnly className="bg-white" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCredentials("password", selectedAccount.password)}
                      >
                        {copiedField === "password" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => handleDemoLogin(selectedAccount)} disabled={isLoggingIn} className="flex-1">
                  {isLoggingIn ? (
                    "Logging in..."
                  ) : (
                    <>
                      Login as {selectedAccount.role}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open("/login", "_blank")
                  }}
                >
                  Manual Login
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Demo data is reset every 24 hours. All actions are simulated and safe to explore.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Preview */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What you'll experience in the demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Real Interface</h3>
              <p className="text-gray-600 text-sm">
                Experience the actual platform interface with all features enabled
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Sample Data</h3>
              <p className="text-gray-600 text-sm">Interact with realistic loads, users, and transactions</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Full Functionality</h3>
              <p className="text-gray-600 text-sm">
                Test all features including posting loads, messaging, and analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
