"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, DollarSign, TrendingUp, Calendar, Truck, Star } from "lucide-react"
import { LoadBoard } from "./load-board"
import { CarrierProfile } from "./carrier-profile"
import { BookedLoads } from "./booked-loads"
import { SubscriptionPlan } from "./subscription-plan"
import { PostTruck } from "./post-truck"
import { CarrierSupport } from "./carrier-support"

export function CarrierDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Listen for navigation events from the main layout
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab)
      }
    }

    window.addEventListener("dashboardTabChange", handleTabChange as EventListener)

    // Check URL hash on component mount
    if (window.location.hash) {
      const tab = window.location.hash.substring(1)
      if (
        ["dashboard", "find-loads", "booked-loads", "post-truck", "support", "profile", "subscription"].includes(tab)
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

  const stats = {
    totalEarnings: 15420,
    completedLoads: 23,
    averageRate: 670,
    rating: 4.8,
  }

  const upcomingLoads = [
    {
      id: "LD-001",
      origin: "Chicago, IL",
      destination: "Milwaukee, WI",
      pickupDate: "2024-01-16",
      rate: 850,
      status: "confirmed",
    },
    {
      id: "LD-002",
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
          <h1 className="text-3xl font-bold">Carrier Dashboard</h1>
          <p className="text-gray-600">Welcome back, Mike Johnson</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">Find New Loads</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="find-loads">Find Loads</TabsTrigger>
          <TabsTrigger value="booked-loads">Booked Loads</TabsTrigger>
          <TabsTrigger value="post-truck">Post Truck</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
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
                <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Loads</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedLoads}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.averageRate}</div>
                <p className="text-xs text-muted-foreground">Per load</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rating}/5.0</div>
                <p className="text-xs text-muted-foreground">From 18 reviews</p>
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
                <div className="space-y-4">
                  {upcomingLoads.map((load) => (
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
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest load activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Load LD-003 delivered successfully</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New load LD-001 confirmed</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment received for LD-002</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
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
                  <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                  <p className="text-sm text-gray-600">On-time Delivery Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
                  <p className="text-sm text-gray-600">Miles per Day Average</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">$2.1</div>
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

        <TabsContent value="support">
          <CarrierSupport />
        </TabsContent>

        <TabsContent value="profile">
          <CarrierProfile />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionPlan />
        </TabsContent>
      </Tabs>
    </div>
  )
}
