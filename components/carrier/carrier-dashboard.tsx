"use client"

import { useState, useEffect } from "react"
import { LogoutButton } from "@/components/shared/logout-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, DollarSign, TrendingUp, Calendar, Truck, Star } from "lucide-react"
import { LoadBoard } from "./load-board"
import { CarrierProfile } from "./carrier-profile"
import { BookedLoads } from "./booked-loads"
//import { SubscriptionPlan } from "./subscription-plan"
import { PostTruck } from "./post-truck"
import { CarrierSupport } from "./carrier-support"
import { CarrierMessages } from "./carrier-messages"
import { SubscriptionCard } from "@/components/shared/subscription-card"
import { WelcomeNewUser } from "../dashboard/welcome-new-user"
import { useAuth } from "@/lib/auth-context"

export function CarrierDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEarnings: 0,
      completedLoads: 0,
      averageRate: 0,
      rating: 0,
    },
    upcomingLoads: [],
    recentActivity: []
  })

  // Check for first login
  useEffect(() => {
    if (user?.firstLogin) {
      setIsFirstLogin(true)
    }
  }, [user])

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || isFirstLogin) return
      
      setLoading(true)
      try {
        const response = await fetch('/api/carrier/dashboard')
        
        if (response.ok) {
          const data = await response.json()
          setDashboardData({
            stats: data.stats || {
              totalEarnings: 0,
              completedLoads: 0,
              averageRate: 0,
              rating: 0,
            },
            upcomingLoads: data.upcomingLoads || [],
            recentActivity: data.recentActivity || []
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
      const interval = setInterval(loadDashboardData, 30000)
      return () => clearInterval(interval)
    }
  }, [user, isFirstLogin])

  // Listen for navigation events from the main layout
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
        ["dashboard", "find-loads", "booked-loads", "post-truck", "messages", "support", "settings", "profile", "subscription"].includes(tab)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-transit":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isFirstLogin) {
    return (
      <WelcomeNewUser 
        userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
        userRole={user?.role || 'carrier'}
        onGetStarted={handleGetStarted}
      />
    )
  }

  return (
    <div className="space-y-6">   
      <div className="space-y-4">
        <div className="flex items-center justify-between"> 
          <div>
            <h1 className="text-3xl font-bold">Carrier Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
            </p>
          </div>
          <LogoutButton variant="outline" />
        </div>
        <div className="flex justify-end">
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={() => setActiveTab("find-loads")}
          >
            Find New Loads
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="find-loads">Find Loads</TabsTrigger>
          <TabsTrigger value="booked-loads">Booked Loads</TabsTrigger>
          <TabsTrigger value="post-truck">Post Truck</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    `$${dashboardData.stats.totalEarnings.toLocaleString()}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Loads</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    dashboardData.stats.completedLoads
                  )}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    dashboardData.stats.averageRate > 0 ? `$${dashboardData.stats.averageRate}` : '$0'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Per load</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    dashboardData.stats.rating > 0 ? `${dashboardData.stats.rating}/5.0` : 'N/A'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.stats.rating > 0 ? 'From reviews' : 'No reviews yet'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Loads */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Loads</CardTitle>
                <CardDescription>Your confirmed and pending loads</CardDescription>
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
                            <p className="text-xs text-gray-500">
                              {load.origin} → {load.destination}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{load.pickupDate}</span>
                            </div>
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
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No upcoming loads</p>
                    <p className="text-sm text-gray-500 mb-4">Find and book loads to get started</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("find-loads")}
                    >
                      Browse Available Loads
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest load activities</CardDescription>
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
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-500' : 
                          activity.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your key performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {loading ? '--' : '0%'}
                  </div>
                  <p className="text-sm text-gray-600">On-time Delivery Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {loading ? '--' : '0'}
                  </div>
                  <p className="text-sm text-gray-600">Miles per Day Average</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {loading ? '--' : '$0'}
                  </div>
                  <p className="text-sm text-gray-600">Average Rate per Mile</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="find-loads">
          <LoadBoard />
        </TabsContent>

        <TabsContent value="booked-loads">
          <BookedLoads />
        </TabsContent>

        <TabsContent value="post-truck">
          <PostTruck />
        </TabsContent>

        <TabsContent value="messages">
          <CarrierMessages />
        </TabsContent>

        <TabsContent value="support">
          <CarrierSupport />
        </TabsContent>

        <TabsContent value="profile">
          <CarrierProfile />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionCard userType="carrier" userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}