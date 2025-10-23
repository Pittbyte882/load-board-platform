"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, MapPin, Calendar, DollarSign, Truck, Phone, MessageSquare, RefreshCw, CheckCircle } from "lucide-react"

interface BookedLoad {
  id: string
  load_id: string
  broker_id: string
  broker_name: string
  broker_company: string
  broker_mc: string
  accepted_rate: number
  approval_status: string
  accepted_at: string
  approved_at: string | null
  accepted_by_phone: string | null
  accepted_by_mc_number: string | null
  // Load details
  origin: string
  destination: string
  pickup_location: string
  delivery_location: string
  pickup_date: string
  delivery_date: string
  weight: number
  distance: number
  equipment_type: string
  load_type: string
  description: string
  expedited?: boolean
  hazmat?: boolean
  team_driver?: boolean
}

export function DispatcherBookedLoads() {
  const { user } = useAuth()
  const [bookedLoads, setBookedLoads] = useState<BookedLoad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLoad, setSelectedLoad] = useState<BookedLoad | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "approved" | "pending">("all")

  useEffect(() => {
    if (user) {
      fetchBookedLoads()
    }
  }, [user])

  const fetchBookedLoads = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching booked loads for dispatcher...")
      const response = await fetch("/api/dispatcher/booked-loads", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched booked loads:", data.length)
        setBookedLoads(data)
      } else {
        console.error("Failed to fetch booked loads:", response.status)
      }
    } catch (error) {
      console.error("Error fetching booked loads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLoads = bookedLoads.filter((load) => {
    if (activeFilter === "all") return true
    if (activeFilter === "approved") return load.approval_status === "approved"
    if (activeFilter === "pending") return load.approval_status === "pending"
    return true
  })

  const handleViewDetails = (load: BookedLoad) => {
    setSelectedLoad(load)
    setIsDetailsDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRatePerMile = (rate: number, distance: number) => {
    if (!distance || distance === 0) return "0.00"
    return (rate / distance).toFixed(2)
  }

  const approvedCount = bookedLoads.filter((l) => l.approval_status === "approved").length
  const pendingCount = bookedLoads.filter((l) => l.approval_status === "pending").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Booked Loads</h2>
          <p className="text-gray-600">View and manage your accepted and approved loads</p>
        </div>
        <Button onClick={fetchBookedLoads} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Booked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookedLoads.length}</div>
            <p className="text-xs text-gray-500 mt-1">All accepted loads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-gray-500 mt-1">Confirmed by broker</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting broker confirmation</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as "all" | "approved" | "pending")}>
        <TabsList>
          <TabsTrigger value="all">All ({bookedLoads.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loads List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLoads.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Booked Loads</h3>
              <p className="text-gray-600">
                {activeFilter === "all"
                  ? "You haven't accepted any loads yet. Check the Find Loads tab to book your first load!"
                  : activeFilter === "approved"
                    ? "No approved loads at this time."
                    : "No loads pending approval."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLoads.map((load) => (
            <Card key={load.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Load #{load.load_id}</h3>
                          <p className="text-sm text-gray-600">{load.broker_company}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(load.approval_status)} variant="secondary">
                        {load.approval_status === "approved" ? "✓ Approved" : "⏳ Pending Approval"}
                      </Badge>
                    </div>

                    {/* Route */}
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{load.pickup_location}</div>
                        <div className="text-gray-400">↓</div>
                        <div className="font-medium">{load.delivery_location}</div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                      <div>
                        <div className="text-xs text-gray-500">Rate</div>
                        <div className="font-bold text-green-600 text-lg">${load.accepted_rate.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          ${getRatePerMile(load.accepted_rate, load.distance)}/mile
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Distance</div>
                        <div className="font-semibold">{load.distance} miles</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Equipment</div>
                        <div className="font-semibold">{load.equipment_type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Weight</div>
                        <div className="font-semibold">{load.weight.toLocaleString()} lbs</div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center space-x-4 text-sm pt-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Pickup:</span>
                        <span className="font-medium">{formatDate(load.pickup_date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-medium">{formatDate(load.delivery_date)}</span>
                      </div>
                    </div>

                    {/* Special Requirements */}
                    {(load.expedited || load.hazmat || load.team_driver) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {load.expedited && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            🚀 Expedited
                          </Badge>
                        )}
                        {load.hazmat && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            ⚠️ HAZMAT
                          </Badge>
                        )}
                        {load.team_driver && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            👥 Team Driver
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Acceptance Info */}
                    <div className="pt-3 border-t text-xs text-gray-500">
                      <div>Accepted: {formatDate(load.accepted_at)}</div>
                      {load.approved_at && <div>Approved: {formatDate(load.approved_at)}</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button onClick={() => handleViewDetails(load)} size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Details - #{selectedLoad?.load_id}</DialogTitle>
            <DialogDescription>Complete information about this booked load</DialogDescription>
          </DialogHeader>
          {selectedLoad && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg ${selectedLoad.approval_status === "approved" ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}
              >
                <div className="flex items-center space-x-2">
                  {selectedLoad.approval_status === "approved" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Package className="h-5 w-5 text-yellow-600" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {selectedLoad.approval_status === "approved" ? "Load Approved & Confirmed" : "Awaiting Broker Approval"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedLoad.approval_status === "approved"
                        ? "This load has been confirmed by the broker. You can proceed with dispatch."
                        : "The broker is reviewing your acceptance. You'll be notified once approved."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Rate Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Accepted Rate</div>
                    <div className="text-2xl font-bold text-green-600">${selectedLoad.accepted_rate.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Rate Per Mile</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${getRatePerMile(selectedLoad.accepted_rate, selectedLoad.distance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div>
                <h4 className="font-semibold mb-3">Route Information</h4>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Pickup Location</div>
                      <div className="font-medium">{selectedLoad.pickup_location}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(selectedLoad.pickup_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="border-l-2 border-gray-300 ml-2 pl-6 py-2">
                    <div className="text-sm text-gray-600">{selectedLoad.distance} miles</div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Delivery Location</div>
                      <div className="font-medium">{selectedLoad.delivery_location}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(selectedLoad.delivery_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Load Details */}
              <div>
                <h4 className="font-semibold mb-3">Load Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Equipment Type</div>
                    <div className="font-medium">{selectedLoad.equipment_type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Load Type</div>
                    <div className="font-medium">{selectedLoad.load_type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Weight</div>
                    <div className="font-medium">{selectedLoad.weight.toLocaleString()} lbs</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Distance</div>
                    <div className="font-medium">{selectedLoad.distance} miles</div>
                  </div>
                </div>

                {selectedLoad.description && (
                  <div className="mt-3 bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Description</div>
                    <div className="text-sm">{selectedLoad.description}</div>
                  </div>
                )}
              </div>

              {/* Broker Information */}
              <div>
                <h4 className="font-semibold mb-3">Broker Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <div className="text-sm text-gray-600">Company</div>
                    <div className="font-medium">{selectedLoad.broker_company}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Contact Person</div>
                    <div className="font-medium">{selectedLoad.broker_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">MC Number</div>
                    <div className="font-medium">{selectedLoad.broker_mc}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-semibold mb-3">Timeline</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Load Accepted:</span>
                    <span className="font-medium">{formatDate(selectedLoad.accepted_at)}</span>
                  </div>
                  {selectedLoad.approved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Broker Approved:</span>
                      <span className="font-medium text-green-600">{formatDate(selectedLoad.approved_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
