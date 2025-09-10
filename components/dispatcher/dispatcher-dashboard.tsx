"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, DollarSign, TrendingUp, Truck } from "lucide-react"
import { ManageCarriers } from "./manage-carriers"
import { DispatcherLoadBoard } from "./dispatcher-load-board"
import { DispatcherMessages } from "./dispatcher-messages"
import { DispatcherProfile } from "./dispatcher-profile"
import { DispatcherSupport } from "./dispatcher-support"

export function DispatcherDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Listen for navigation events from sidebar
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail.tab)
    }

    window.addEventListener("dashboardTabChange", handleTabChange as EventListener)

    return () => {
      window.removeEventListener("dashboardTabChange", handleTabChange as EventListener)
    }
  }, [])

  const stats = {
    totalCarriers: 8,
    activeLoads: 12,
    totalRevenue: 28500,
    avgLoadValue: 750,
  }

  const recentActivity = [
    {
      id: "1",
      type: "load_booked",
      message: "Load LD-001 booked for Driver Mike Johnson",
      timestamp: "2 hours ago",
      carrier: "Mike Johnson",
    },
    {
      id: "2",
      type: "load_delivered",
      message: "Load LD-003 delivered by Sarah Wilson",
      timestamp: "4 hours ago",
      carrier: "Sarah Wilson",
    },
    {
      id: "3",
      type: "carrier_added",
      message: "New carrier Tom Davis added to fleet",
      timestamp: "1 day ago",
      carrier: "Tom Davis",
    },
  ]

  const upcomingLoads = [
    {
      id: "LD-001",
      carrier: "Mike Johnson",
      origin: "Chicago, IL",
      destination: "Milwaukee, WI",
      pickupDate: "2024-01-16",
      rate: 850,
      status: "confirmed",
    },
    {
      id: "LD-002",
      carrier: "Sarah Wilson",
      origin: "Detroit, MI",
      destination: "Grand Rapids, MI",
      pickupDate: "2024-01-18",
      rate: 650,
      status: "pending",
    },
  ]

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dispatcher Dashboard</h1>
          <p className="text-gray-600">Welcome back, Sarah Wilson</p>
        </div>
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

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Carriers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCarriers}</div>
                <p className="text-xs text-muted-foreground">Active drivers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeLoads}</div>
                <p className="text-xs text-muted-foreground">Currently dispatched</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.avgLoadValue}</div>
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
                <div className="space-y-4">
                  {upcomingLoads.map((load) => (
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
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your fleet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Fleet Performance</CardTitle>
              <CardDescription>Key metrics for your carrier fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">96%</div>
                  <p className="text-sm text-gray-600">On-time Delivery Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">4.7</div>
                  <p className="text-sm text-gray-600">Average Carrier Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">$2.3</div>
                  <p className="text-sm text-gray-600">Average Rate per Mile</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <p className="text-gray-500">Route planning feature coming soon...</p>
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
