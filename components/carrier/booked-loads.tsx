"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Calendar, Package, Phone, MessageSquare, Navigation, Clock } from "lucide-react"

export function BookedLoads() {
  const [searchTerm, setSearchTerm] = useState("")

  const loads = [
    {
      id: "LD-001",
      origin: "Chicago, IL",
      destination: "Milwaukee, WI",
      pickupDate: "2024-01-16",
      deliveryDate: "2024-01-17",
      rate: 850,
      status: "confirmed",
      broker: "Swift Logistics",
      commodity: "Electronics",
      weight: "2,500 lbs",
      distance: "92 miles",
    },
    {
      id: "LD-002",
      origin: "Detroit, MI",
      destination: "Grand Rapids, MI",
      pickupDate: "2024-01-18",
      deliveryDate: "2024-01-18",
      rate: 650,
      status: "in-transit",
      broker: "Midwest Freight",
      commodity: "Medical Supplies",
      weight: "1,800 lbs",
      distance: "158 miles",
    },
    {
      id: "LD-003",
      origin: "Indianapolis, IN",
      destination: "Louisville, KY",
      pickupDate: "2024-01-12",
      deliveryDate: "2024-01-13",
      rate: 720,
      status: "delivered",
      broker: "Central Transport",
      commodity: "Auto Parts",
      weight: "3,200 lbs",
      distance: "114 miles",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "in-transit":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredLoads = loads.filter(
    (load) =>
      load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeLoads = filteredLoads.filter((load) => load.status === "confirmed" || load.status === "in-transit")
  const completedLoads = filteredLoads.filter((load) => load.status === "delivered")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booked Loads</h1>
          <p className="text-gray-600">Manage your confirmed and completed loads</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search loads by ID, origin, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Loads ({activeLoads.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedLoads.length})</TabsTrigger>
          <TabsTrigger value="all">All Loads ({filteredLoads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeLoads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active loads</h3>
                <p className="text-gray-500">You don't have any active loads at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            activeLoads.map((load) => (
              <Card key={load.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="font-mono">
                            {load.id}
                          </Badge>
                          <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${load.rate}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">From</p>
                            <p className="text-lg font-semibold">{load.origin}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">To</p>
                            <p className="text-lg font-semibold">{load.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">Pickup</p>
                            <p className="text-lg font-semibold">{load.pickupDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">Weight</p>
                            <p className="text-lg font-semibold">{load.weight}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">Commodity</p>
                            <p className="font-medium">{load.commodity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Broker</p>
                            <p className="font-medium">{load.broker}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Distance</p>
                            <p className="font-medium">{load.distance}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:w-48">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedLoads.map((load) => (
            <Card key={load.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono">
                          {load.id}
                        </Badge>
                        <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${load.rate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">From</p>
                          <p className="text-lg font-semibold">{load.origin}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">To</p>
                          <p className="text-lg font-semibold">{load.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Delivered</p>
                          <p className="text-lg font-semibold">{load.deliveryDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Weight</p>
                          <p className="text-lg font-semibold">{load.weight}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">Commodity</p>
                          <p className="font-medium">{load.commodity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Broker</p>
                          <p className="font-medium">{load.broker}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Distance</p>
                          <p className="font-medium">{load.distance}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 lg:w-48">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Details
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Download Invoice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredLoads.map((load) => (
            <Card key={load.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono">
                          {load.id}
                        </Badge>
                        <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${load.rate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">From</p>
                          <p className="text-lg font-semibold">{load.origin}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">To</p>
                          <p className="text-lg font-semibold">{load.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{load.status === "delivered" ? "Delivered" : "Pickup"}</p>
                          <p className="text-lg font-semibold">
                            {load.status === "delivered" ? load.deliveryDate : load.pickupDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Weight</p>
                          <p className="text-lg font-semibold">{load.weight}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">Commodity</p>
                          <p className="font-medium">{load.commodity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Broker</p>
                          <p className="font-medium">{load.broker}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Distance</p>
                          <p className="font-medium">{load.distance}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 lg:w-48">
                    {load.status === "delivered" ? (
                      <>
                        <Button variant="outline" className="w-full bg-transparent">
                          View Details
                        </Button>
                        <Button variant="outline" className="w-full bg-transparent">
                          Download Invoice
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
