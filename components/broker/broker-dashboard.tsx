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

export function BrokerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

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

  const stats = {
    totalRevenue: 45230,
    activeLoads: 12,
    completedLoads: 89,
    averageRate: 1250,
  }

  const recentLoads = [
    {
      id: "LD-001",
      origin: "Chicago, IL",
      destination: "Milwaukee, WI",
      pickupDate: "2024-01-16",
      rate: 850,
      status: "posted",
    },
    {
      id: "LD-002",
      origin: "Detroit, MI",
      destination: "Grand Rapids, MI",
      pickupDate: "2024-01-18",
      rate: 650,
      status: "claimed",
    },
    {
      id: "LD-003",
      origin: "Indianapolis, IN",
      destination: "Louisville, KY",
      pickupDate: "2024-01-20",
      rate: 450,
      status: "in-transit",
    },
  ]

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
          <p className="text-gray-600">Welcome back, Sarah Wilson</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleNavigateToPostLoad}>
          Post New Load
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
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
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeLoads}</div>
                <p className="text-xs text-muted-foreground">Currently posted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Loads</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedLoads}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.averageRate}</div>
                <p className="text-xs text-muted-foreground">Per load</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Loads */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Loads</CardTitle>
                <CardDescription>Your latest posted loads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLoads.map((load) => (
                    <div key={load.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                          <Package className="h-5 w-5 text-green-600" />
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
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start bg-transparent"
                    variant="outline"
                    onClick={handleNavigateToPostLoad}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Post New Load
                  </Button>
                  <Button
                    className="w-full justify-start bg-transparent"
                    variant="outline"
                    onClick={() => setActiveTab("available-trucks")}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Find Available Trucks
                  </Button>
                  <Button
                    className="w-full justify-start bg-transparent"
                    variant="outline"
                    onClick={() => setActiveTab("messages")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Check Messages
                  </Button>
                  <Button
                    className="w-full justify-start bg-transparent"
                    variant="outline"
                    onClick={() => setActiveTab("my-loads")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Loads
                  </Button>
                </div>
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
                  <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                  <p className="text-sm text-gray-600">Load Fill Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2.3</div>
                  <p className="text-sm text-gray-600">Days Average to Fill</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.7</div>
                  <p className="text-sm text-gray-600">Carrier Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-loads">
          <MyLoads onNavigateToPostLoad={handleNavigateToPostLoad} />
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
