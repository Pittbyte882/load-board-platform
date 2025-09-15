"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge }    from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, DollarSign, TrendingUp, Calendar, Users, MessageSquare, Truck } from "lucide-react"
import { MyLoads } from "./my-loads"
import { PostLoadForm } from "./post-load-form"
import { BrokerProfile } from "./broker-profile"
import { BrokerSettings } from "./broker-settings"
import { BrokerMessages } from "./broker-messages"
import { AvailableTrucks } from "./available-trucks"
import { BrokerSupport } from "./broker-support"
import { WelcomeNewUser } from "../dashboard/welcome-new-user" // Add this import
import { useAuth } from "@/lib/auth-context" // Add this import

export function BrokerDashboard() {
  const { user } = useAuth() // Add this
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isFirstLogin, setIsFirstLogin] = useState(false) // Add this

  // Add this useEffect to check for first login
  useEffect(() => {
    if (user?.firstLogin) {
      setIsFirstLogin(true)
    }
  }, [user])

  // Add this function to handle welcome completion
  const handleGetStarted = async () => {
    try {
      await fetch('/api/auth/mark-welcome-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })
      setIsFirstLogin(false)
    } catch (error) {
      console.error('Error marking welcome complete:', error)
      setIsFirstLogin(false) // Continue anyway
    }
  }

  // Add this early return for first-time users
  if (isFirstLogin) {
    return (
      <WelcomeNewUser 
        userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
        userRole={user?.role || 'broker'}
        onGetStarted={handleGetStarted}
      />
    )
  }

  // Listen for navigation events from the main layout
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      console.log("Received dashboardTabChange event:", event.detail)
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab)
      }
    }

    window.addEventListener("dashboardTabChange", handleTabChange as EventListener)

    // Check URL hash on component mount
    if (window.location.hash) {
      const tab = window.location.hash.substring(1)
      if (
        [
          "dashboard",
          "my-loads",
          "post-load",
          "available-trucks",
          "messages",
          "support",
          "profile",
          "settings",
        ].includes(tab)
      ) {
        setActiveTab(tab)
      }
    }

    return () => {
      window.removeEventListener("dashboardTabChange", handleTabChange as EventListener)
    }
  }, [])

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== "dashboard") {
      window.history.replaceState({}, "", `#${activeTab}`)
    } else {
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [activeTab])

  // Navigation function to pass to child components
  const handleNavigateToPostLoad = () => {
    console.log("handleNavigateToPostLoad called, switching to post-load tab")
    setActiveTab("post-load")
  }

  // Your existing stats and recentLoads data...
  const stats = {
    totalRevenue: 0, // Change to 0 for new users
    activeLoads: 0,  // Change to 0 for new users
    completedLoads: 0, // Change to 0 for new users
    averageRate: 0,    // Change to 0 for new users
  }

  const recentLoads = [] // Empty array for new users

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted":
        return "bg-blue-100 text-blue-800"
      case "claimed":
        return "bg-yellow-100 text-yellow-800"
      case "in-transit":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Broker Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleNavigateToPostLoad}>
          Post New Load
        </Button>
      </div>

      {/* Rest of your existing component stays the same... */}
    </div>
  )
}