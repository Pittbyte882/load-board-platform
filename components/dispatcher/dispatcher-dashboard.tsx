"use client"

import { useState, useEffect } from "react"
import { LogoutButton } from "@/components/shared/logout-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, DollarSign, TrendingUp, Truck, Star } from "lucide-react"
import { ManageCarriers } from "./manage-carriers"
import { DispatcherLoadBoard } from "./dispatcher-load-board"
import { DispatcherMessages } from "./dispatcher-messages"
import { DispatcherProfile } from "./dispatcher-profile"
import { DispatcherSupport } from "./dispatcher-support"
import { WelcomeNewUser } from "../dashboard/welcome-new-user"
import { useAuth } from "@/lib/auth-context"

export function DispatcherDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCarriers: 0,
      activeLoads: 0,
      totalRevenue: 0,
      avgLoadValue: 0,
      rating: 0,
    },
    upcomingLoads: [],
    recentActivity: []
  })

  // First login check
  useEffect(() => {
    if (user?.firstLogin) setIsFirstLogin(true)
  }, [user])

  // Fetch dispatcher dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || isFirstLogin) return
      setLoading(true)
      try {
        const response = await fetch("/api/dispatcher/dashboard")
        if (response.ok) {
          const data = await response.json()
          setDashboardData({
            stats: data.stats || {
              totalCarriers: 0,
              activeLoads: 0,
              totalRevenue: 0,
              avgLoadValue: 0,
              rating: 0,
            },
            upcomingLoads: data.upcomingLoads || [],
            recentActivity: data.recentActivity || []
          })
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!isFirstLogin) {
      loadDashboardData()
      const interval = setInterval(loadDashboardData, 30000)
      return () => clearInterval(interval)
    }
  }, [user, isFirstLogin])

  // Listen for tab changes from sidebar
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail?.tab) setActiveTab(event.detail.tab)
    }
    window.addEventListener("dashboardTabChange", handleTabChange as EventListener)
    if (window.location.hash) {
      const tab = window.location.hash.substring(1)
      if (["dashboard", "carriers", "loads", "route-planning", "support", "messages", "profile"].includes(tab)) {
        setActiveTab(tab)
      }
    }
    return () => window.removeEventListener("dashboardTabChange", handleTabChange as EventListener)
  }, [])

  // Update URL hash when tab changes
  useEffect(() => {
    if (activeTab !== "dashboard") window.history.replaceState({}, "", `#${activeTab}`)
    else window.history.replaceState({}, "", window.location.pathname)
  }, [activeTab])

  const handleGetStarted = async () => {
    try {
      await fetch("/api/auth/mark-welcome-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })
      setIsFirstLogin(false)
    } catch {
      setIsFirstLogin(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "in-transit": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isFirstLogin) {
    return (
      <WelcomeNewUser
        userName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User"}
        userRole="dispatcher"
        onGetStarted={handleGetStarted}
      />
    )
  }
//logout button
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dispatcher Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User"}
          </p>
        </div>
        <LogoutButton variant="outline" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="carriers">Manage Carriers</TabsTrigger>
          <TabsTrigger value="loads">Find Loads</TabsTrigger>
          <TabsTrigger value="route-planning">Route Planning</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Carriers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "--" : dashboardData.stats.totalCarriers}
                </div>
                <p className="text-xs text-muted-foreground">Active carriers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "--" : dashboardData.stats.activeLoads}
                </div>
                <p className="text-xs text-muted-foreground">Currently dispatched</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "--" : `$${dashboardData.stats.totalRevenue.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "--" : `$${dashboardData.stats.avgLoadValue}`}
                </div>
                <p className="text-xs text-muted-foreground">Per load</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Loads */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Loads</CardTitle>
                <CardDescription>Loads scheduled for your carriers</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : dashboardData.upcomingLoads.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.upcomingLoads.map((load: any) => (
                      <div key={load.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                            <Truck className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{load.id}</p>
                            <p className="text-xs text-gray-500">{load.carrier}</p>
                            <p className="text-xs text-gray-500">
                              {load.origin} → {load.destination}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${load.rate}</p>
                          <Badge className={getStatusColor(load.status)} variant="secondary">
                            {load.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No upcoming loads</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your fleet</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                    ))}
                  </div>
                ) : dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivity.map((activity: any) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="carriers">
          <ManageCarriers />
        </TabsContent>

        <TabsContent value="loads">
          <DispatcherLoadBoard />
        </TabsContent>

        <TabsContent value="route-planning">
          <Card>
            <CardHeader>
              <CardTitle>Route Planning</CardTitle>
              <CardDescription>Plan and optimize routes for your carriers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">Route planning coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <DispatcherSupport />
        </TabsContent>

        <TabsContent value="messages">
          <DispatcherMessages />
        </TabsContent>

        <TabsContent value="profile">
          <DispatcherProfile />
        </TabsContent>
      </Tabs>
    </div>
  )
}
