"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  MapPin,
  Calendar,
  Package,
  Truck,
  Eye,
  Edit,
  MessageCircle,
  X,
  Plus,
  Clock,
  Building,
  Send,
} from "lucide-react"

interface Load {
  id: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  weight: number
  rate: number
  distance: number
  equipment: string
  loadType: "FTL" | "LTL"
  description: string
  status: "available" | "claimed" | "in-transit" | "delivered" | "cancelled"
  postedDate: string
  brokerMcNumber: string
  carrierId?: string
  carrierName?: string
  expedited?: boolean
  hazmat?: boolean
}

interface MyLoadsProps {
  onNavigateToPostLoad: () => void
}

// Equipment types for the select dropdown
const equipmentTypes = [
  "16ft Box Truck",
  "24ft Box Truck",
  "26ft Box Truck",
  "Box Truck Team",
  "Cargo Van",
  "Sprinter Van",
]

export function MyLoads({ onNavigateToPostLoad }: MyLoadsProps) {
  const [loads, setLoads] = useState<Load[]>([])
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("postedDate")

  // Modal states
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    rate: 0,
    weight: 0,
    description: "",
    pickupDate: "",
    deliveryDate: "",
    origin: "",
    destination: "",
    equipment: "",
    expedited: false,
    hazmat: false,
  })

  // Chat state
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<
    Array<{
      id: string
      sender: string
      message: string
      timestamp: string
    }>
  >([])

  useEffect(() => {
    fetchLoads()

    // Listen for new load posted events
    const handleLoadPosted = () => {
      console.log("Received loadPosted event, refreshing loads...")
      fetchLoads()
    }

    window.addEventListener("loadPosted", handleLoadPosted)
    return () => window.removeEventListener("loadPosted", handleLoadPosted)
  }, [])

  useEffect(() => {
    filterAndSortLoads()
  }, [loads, searchTerm, statusFilter, sortBy])

  const fetchLoads = async () => {
    try {
      console.log("Fetching broker loads...")
      const response = await fetch("/api/loads?brokerId=broker-1", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched loads:", data.length)
        setLoads(data)
      } else {
        console.error("Failed to fetch loads:", response.status)
      }
    } catch (error) {
      console.error("Error fetching loads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortLoads = () => {
    const filtered = loads.filter((load) => {
      const matchesSearch =
        !searchTerm ||
        load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || load.status === statusFilter

      return matchesSearch && matchesStatus
    })

    // Sort loads
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rate":
          return b.rate - a.rate
        case "pickupDate":
          return new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime()
        case "status":
          return a.status.localeCompare(b.status)
        default: // postedDate
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      }
    })

    setFilteredLoads(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "claimed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-transit":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "delivered":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "claimed":
        return "bg-blue-500"
      case "in-transit":
        return "bg-yellow-500"
      case "delivered":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getLoadTypeColor = (loadType: string) => {
    return loadType === "FTL" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleViewDetails = (load: Load) => {
    setSelectedLoad(load)
    setShowDetailsModal(true)
  }

  const handleEditLoad = (load: Load) => {
    setSelectedLoad(load)
    setEditForm({
      rate: load.rate,
      weight: load.weight,
      description: load.description,
      pickupDate: load.pickupDate.split("T")[0],
      deliveryDate: load.deliveryDate.split("T")[0],
      origin: load.origin,
      destination: load.destination,
      equipment: load.equipment,
      expedited: load.expedited || false,
      hazmat: load.hazmat || false,
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedLoad) return

    try {
      const updatedLoad = {
        ...selectedLoad,
        ...editForm,
        pickupDate: editForm.pickupDate + "T00:00:00.000Z",
        deliveryDate: editForm.deliveryDate + "T00:00:00.000Z",
      }

      const response = await fetch(`/api/loads/${selectedLoad.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLoad),
      })

      if (response.ok) {
        setLoads((prev) => prev.map((load) => (load.id === selectedLoad.id ? updatedLoad : load)))
        setShowEditModal(false)
        alert("Load updated successfully!")
      } else {
        alert("Failed to update load. Please try again.")
      }
    } catch (error) {
      console.error("Error updating load:", error)
      alert("Error updating load. Please try again.")
    }
  }

  const handleChat = (load: Load) => {
    setSelectedLoad(load)
    // Load existing chat history for this load
    setChatHistory([
      {
        id: "1",
        sender: "Carrier",
        message: "Hi, I'm interested in this load. Can we discuss the rate?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "2",
        sender: "You",
        message: "Hello! The rate is firm at $" + load.rate + ". This includes all necessary permits.",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
    ])
    setShowChatModal(true)
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedLoad) return

    const newMessage = {
      id: Date.now().toString(),
      sender: "You",
      message: chatMessage,
      timestamp: new Date().toISOString(),
    }

    setChatHistory((prev) => [...prev, newMessage])
    setChatMessage("")

    // In a real app, this would send the message via API
    console.log("Sending message:", newMessage)
  }

  const handleCancelLoad = async (loadId: string) => {
    console.log("Cancelling load:", loadId)
    if (confirm("Are you sure you want to cancel and delete this load? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/loads/${loadId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          // Remove the load from local state immediately
          setLoads((prev) => prev.filter((load) => load.id !== loadId))
          console.log(`Load ${loadId} deleted successfully`)
        } else {
          console.error("Failed to delete load:", response.status)
          alert("Failed to delete load. Please try again.")
        }
      } catch (error) {
        console.error("Error deleting load:", error)
        alert("Error deleting load. Please try again.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your loads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Loads</h1>
          <p className="text-gray-600">{filteredLoads.length} loads found</p>
        </div>
        <Button onClick={onNavigateToPostLoad} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Post New Load
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search loads by ID, origin, destination, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postedDate">Newest First</SelectItem>
                <SelectItem value="rate">Highest Rate</SelectItem>
                <SelectItem value="pickupDate">Pickup Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loads List */}
      <div className="space-y-4">
        {filteredLoads.map((load) => (
          <Card key={load.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="font-mono">
                        {load.id}
                      </Badge>
                      <Badge variant="secondary">{load.equipment}</Badge>
                      <Badge className={getLoadTypeColor(load.loadType)}>{load.loadType}</Badge>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(load.status)}`}></div>
                        <Badge className={getStatusColor(load.status)}>
                          {load.status.charAt(0).toUpperCase() + load.status.slice(1)}
                        </Badge>
                      </div>
                      {load.expedited && <Badge variant="destructive">Expedited</Badge>}
                      {load.hazmat && <Badge variant="destructive">Hazmat</Badge>}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${load.rate.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">${(load.rate / load.distance).toFixed(2)}/mile</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
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
                        <p className="text-lg font-semibold">{formatDate(load.pickupDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Weight</p>
                        <p className="text-lg font-semibold">{load.weight.toLocaleString()} lbs</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Distance</p>
                        <p className="text-lg font-semibold">{load.distance} mi</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">MC Number</p>
                        <p className="text-lg font-semibold">{load.brokerMcNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium">{load.description}</p>
                      </div>
                      {load.carrierName && (
                        <div>
                          <p className="text-sm text-gray-500">Carrier</p>
                          <p className="font-medium">{load.carrierName}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Posted {formatDate(load.postedDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 lg:w-48">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(load)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditLoad(load)}
                      disabled={load.status === "delivered" || load.status === "cancelled"}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleChat(load)} disabled={!load.carrierName}>
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelLoad(load.id)}
                      disabled={load.status === "delivered" || load.status === "cancelled"}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLoads.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loads found</h3>
            <p className="text-gray-500 mb-4">
              {loads.length === 0
                ? "You haven't posted any loads yet. Create your first load to get started."
                : "No loads match your current filters. Try adjusting your search criteria."}
            </p>
            {loads.length === 0 && (
              <Button onClick={onNavigateToPostLoad} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Load
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Details - {selectedLoad?.id}</DialogTitle>
          </DialogHeader>
          {selectedLoad && (
            <div className="space-y-6">
              {/* Status and Rate Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusDot(selectedLoad.status)}`}></div>
                  <Badge className={getStatusColor(selectedLoad.status)}>
                    {selectedLoad.status.charAt(0).toUpperCase() + selectedLoad.status.slice(1)}
                  </Badge>
                  <Badge className={getLoadTypeColor(selectedLoad.loadType)}>{selectedLoad.loadType}</Badge>
                  {selectedLoad.expedited && <Badge variant="destructive">Expedited</Badge>}
                  {selectedLoad.hazmat && <Badge variant="destructive">Hazmat</Badge>}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">${selectedLoad.rate.toLocaleString()}</p>
                  <p className="text-gray-500">${(selectedLoad.rate / selectedLoad.distance).toFixed(2)}/mile</p>
                </div>
              </div>

              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-green-600" />
                      Pickup Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">{selectedLoad.origin}</p>
                    <p className="text-gray-600">{formatDateTime(selectedLoad.pickupDate)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-red-600" />
                      Delivery Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">{selectedLoad.destination}</p>
                    <p className="text-gray-600">{formatDateTime(selectedLoad.deliveryDate)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Load Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Load Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="text-lg font-semibold">{selectedLoad.weight.toLocaleString()} lbs</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="text-lg font-semibold">{selectedLoad.distance} miles</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Equipment</p>
                      <p className="text-lg font-semibold">{selectedLoad.equipment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">MC Number</p>
                      <p className="text-lg font-semibold">{selectedLoad.brokerMcNumber}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-base">{selectedLoad.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Carrier Information */}
              {selectedLoad.carrierName && (
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Carrier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{selectedLoad.carrierName}</p>
                    <p className="text-gray-600">Carrier ID: {selectedLoad.carrierId}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEditLoad(selectedLoad)
                  }}
                  disabled={selectedLoad.status === "delivered" || selectedLoad.status === "cancelled"}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Load
                </Button>
                {selectedLoad.carrierName && (
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleChat(selectedLoad)
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Carrier
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Load Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Load - {selectedLoad?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Route Information */}
            <div>
              <h3 className="text-lg font-medium mb-3">Route Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    placeholder="e.g., Chicago, IL"
                    value={editForm.origin}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, origin: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Atlanta, GA"
                    value={editForm.destination}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, destination: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="text-lg font-medium mb-3">Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupDate">Pickup Date</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={editForm.pickupDate}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, pickupDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={editForm.deliveryDate}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, deliveryDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Load Details */}
            <div>
              <h3 className="text-lg font-medium mb-3">Load Details</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="rate">Rate ($)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={editForm.rate}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, rate: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={editForm.weight}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, weight: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="equipment">Equipment Type</Label>
                  <Select
                    value={editForm.equipment}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, equipment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <h3 className="text-lg font-medium mb-3">Additional Options</h3>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editForm.expedited}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, expedited: e.target.checked }))}
                  />
                  <span>Expedited</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editForm.hazmat}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, hazmat: e.target.checked }))}
                  />
                  <span>Hazmat</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Chat - Load {selectedLoad?.id}
              {selectedLoad && (
                <div className="text-sm text-gray-500 font-normal">
                  {selectedLoad.origin} → {selectedLoad.destination}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-96">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-3">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === "You" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "You" ? "text-blue-100" : "text-gray-500"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2 mt-4">
              <Input
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
