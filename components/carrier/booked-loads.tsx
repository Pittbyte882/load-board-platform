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
          console.log('📦 Fetched booked loads:', data)
          setLoads(data.loads || [])
        } else {
          console.error('Failed to fetch booked loads:', response.status)
          setLoads([])
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
      load.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.delivery_location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeLoads = filteredLoads.filter((load) => 
    load.bookingStatus === "confirmed" || load.status === "confirmed" || load.status === "in-transit"
  )
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
              <Card key={load.bookingId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{load.id}</h3>
                        <p className="text-sm text-gray-600">{load.description || 'Load Details'}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span>{load.brokerCompany}</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{new Date(load.bookedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${(load.bookedRate || load.rate || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        ${load.distance > 0 ? ((load.bookedRate || load.rate) / load.distance).toFixed(2) : '0.00'}/mile
                      </div>
                      <Badge className={getStatusColor(load.bookingStatus || load.status)}>
                        {load.bookingStatus || load.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Pickup</div>
                        <div className="text-sm text-gray-600">{load.pickup_location}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(load.pickup_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Delivery</div>
                        <div className="text-sm text-gray-600">{load.delivery_location}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(load.delivery_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">{load.equipment_type}</div>
                        <div className="text-sm text-gray-600">{load.weight?.toLocaleString() || 0} lbs</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{load.distance} miles</span>
                      {load.expedited && <Badge variant="destructive">Expedited</Badge>}
                      {load.hazmat && <Badge variant="destructive">Hazmat</Badge>}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
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
              <Card key={load.bookingId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">Completed Load: {load.id}</div>
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
              <Card key={load.bookingId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">All Load: {load.id}</div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}