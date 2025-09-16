"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, DollarSign, TrendingUp, Calendar, Users, MessageSquare, Truck } from "lucide-react"
import { MyLoads } from "./my-loads"
import { PostLoadForm } from "./post-load-form"
import { BrokerProfile } from "./broker-profile"
import { BrokerSettings } from "./broker-settings"
import { BrokerMessages } from "./broker-messages"
import { AvailableTrucks } from "./available-trucks"
import { BrokerSupport } from "./broker-support"
import { WelcomeNewUser } from "../dashboard/welcome-new-user"
import { useAuth } from "@/lib/auth-context"

export function BrokerDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRevenue: 0,
      activeLoads: 0,
      completedLoads: 0,
      averageRate: 0,
    },
    recentLoads: []
  })

  // Check for first login
  useEffect(() => {
    if (user?.firstLogin) {
      setIsFirstLogin(true)
    }
  }, [user])

  // Load real dashboard data from your API
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || isFirstLogin) return
      
      setLoading(true)
      try {
        // Fetch real data from your API
        const response = await fetch('/api/broker/dashboard', {
          headers: {
            //'Authorization': `Bearer ${user.token}`, // if you use auth tokens
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setDashboardData({
            stats: data.stats || {
              totalRevenue: 0,
              activeLoads: 0,
              completedLoads: 0,
              averageRate: 0,
            },
            recentLoads: data.recentLoads || []
          })
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!isFirstLogin) {
      loadDashboardData()
      // Set up polling for real-time updates
      const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user, isFirstLogin])

  // Tab handling code 
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab)
      }
    }

    window.addEventListener("dashboardTabChange", handleTabChange as EventListener)

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

  useEffect(() => {
    if (activeTab !== "dashboard") {
      window.history.replaceState({}, "", `#${activeTab}`)
    } else {
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [activeTab])

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
      setIsFirstLogin(false)
    }
  }

  const handleNavigateToPostLoad = () => {
    setActiveTab("post-load")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted":
      case "available":
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

  
  if (isFirstLogin) {
    return (
      <WelcomeNewUser 
        userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
        userRole={user?.role || 'broker'}
        onGetStarted={handleGetStarted}
      />
    )
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="my-loads">My Loads</TabsTrigger>
          <TabsTrigger value="post-load">Post Load</TabsTrigger>
          <TabsTrigger value="available-trucks">Available Trucks</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    `$${dashboardData.stats.totalRevenue.toLocaleString()}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    dashboardData.stats.activeLoads
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Loads</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    dashboardData.stats.completedLoads
                  )}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rate/Mile</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    `$${dashboardData.stats.averageRate.toFixed(2)}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Current average</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Loads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Loads</CardTitle>
              <CardDescription>Your most recent load postings</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : dashboardData.recentLoads.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentLoads.map((load: any) => (
                    <div key={load.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium">{load.id}</p>
                        <p className="text-sm text-gray-600">
                          {load.origin} → {load.destination}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{load.equipmentType}</Badge>
                          <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${load.rate}</p>
                        <p className="text-sm text-gray-600">${load.ratePerMile}/mile</p>
                        <p className="text-xs text-gray-500">Pickup: {new Date(load.pickupDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No loads posted yet</p>
                  <p className="text-sm text-gray-500 mb-4">Get started by posting your first load</p>
                  <Button 
                    variant="outline" 
                    onClick={handleNavigateToPostLoad}
                  >
                    Post Your First Load
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-loads">
          <MyLoads onNavigateToPostLoad={() => setActiveTab("post-load")} />
        </TabsContent>

        <TabsContent value="post-load">
          <PostLoadForm onSuccess={() => setActiveTab("my-loads")} />
        </TabsContent>

        <TabsContent value="available-trucks">
          <AvailableTrucks />
        </TabsContent>

        <TabsContent value="messages">
          <BrokerMessages />
        </TabsContent>

        <TabsContent value="support">
          <BrokerSupport />
        </TabsContent>

        <TabsContent value="profile">
          <BrokerProfile />
        </TabsContent>

        <TabsContent value="settings">
          <BrokerSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}