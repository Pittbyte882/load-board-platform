"use client"
import { LocationAutocomplete } from "@/components/ui/location-autocomplete"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Calendar, Package, Phone, MessageSquare, Navigation, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function BookedLoads() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [loads, setLoads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch booked loads from API
  useEffect(() => {
    const fetchBookedLoads = async () => {
      if (!user?.id) return
      
      setLoading(true)
      try {
        const response = await fetch('/api/carrier/booked-loads')
        
        if (response.ok) {
          const data = await response.json()
          setLoads(data.loads || [])
        }
      } catch (error) {
        console.error('Error fetching booked loads:', error)
        setLoads([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookedLoads()
  }, [user])

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
      load.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination?.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <LocationAutocomplete
            placeholder="Search loads by ID, origin, or destination..."
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Loads ({activeLoads.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedLoads.length})</TabsTrigger>
          <TabsTrigger value="all">All Loads ({filteredLoads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-500">Loading your loads...</p>
                </div>
              </CardContent>
            </Card>
          ) : activeLoads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active loads</h3>
                <p className="text-gray-500">You don't have any active loads at the moment.</p>
                <p className="text-sm text-gray-400 mt-2">Book loads from the Find Loads page to see them here.</p>
              </CardContent>
            </Card>
          ) : (
            activeLoads.map((load) => (
              <Card key={load.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Your existing load card content */}
                  {/* Keep the same structure but use dynamic data from 'load' object */}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-500">Loading completed loads...</p>
                </div>
              </CardContent>
            </Card>
          ) : completedLoads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed loads</h3>
                <p className="text-gray-500">You haven't completed any loads yet.</p>
              </CardContent>
            </Card>
          ) : (
            completedLoads.map((load) => (
              <Card key={load.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Your existing completed load card content */}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-500">Loading all loads...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredLoads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No loads found</h3>
                <p className="text-gray-500">You don't have any booked loads yet.</p>
                <p className="text-sm text-gray-400 mt-2">Start booking loads to build your history.</p>
              </CardContent>
            </Card>
          ) : (
            filteredLoads.map((load) => (
              <Card key={load.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Your existing all loads card content */}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}