"use client"
import { useAuth } from "@/lib/auth-context"
import { LocationAutocomplete } from "@/components/ui/location-autocomplete"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { showToastWithLogo } from "@/components/ui/custom-toasts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Package, Truck, Clock, Search, RefreshCw } from "lucide-react"

interface Load {
  id: string
  broker_id: string
  broker_name: string
  broker_company: string
  broker_mc: string
  origin: string
  destination: string
  pickup_location: string
  delivery_location: string
  pickup_date: string
  delivery_date: string
  weight: number
  rate: number
  distance: number
  equipment: string
  equipment_type: string
  load_type: string
  description: string
  status: string
  expedited?: boolean
  hazmat?: boolean
  team_driver?: boolean
  created_at: string
  posted_date: string
}

export function DispatcherLoadBoard() {
  const { user } = useAuth() 
  const [loads, setLoads] = useState<Load[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [originFilter, setOriginFilter] = useState("")
  const [pickupRadius, setPickupRadius] = useState("50")
  const [dropoffFilter, setDropoffFilter] = useState("")
  const [dropoffRadius, setDropoffRadius] = useState("50")
  const [loadTypeFilter, setLoadTypeFilter] = useState("")
  const [minWeight, setMinWeight] = useState("")
  const [maxWeight, setMaxWeight] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [equipmentFilter, setEquipmentFilter] = useState("")

  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isNegotiateDialogOpen, setIsNegotiateDialogOpen] = useState(false)
  const [counterOffer, setCounterOffer] = useState("")

  useEffect(() => {
    fetchLoads()
  }, [])

  const fetchLoads = async () => {
    setIsLoading(true)
    try {
      console.log("Dispatcher: Fetching available loads...")
      const response = await fetch("/api/loads/available", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Dispatcher: Fetched loads:", data.length)
        setLoads(data)
      } else {
        console.error("Dispatcher: Failed to fetch loads:", response.status)
      }
    } catch (error) {
      console.error("Dispatcher: Error fetching loads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLoads = loads.filter((load) => {
    const matchesOrigin = !originFilter || load.pickup_location.toLowerCase().includes(originFilter.toLowerCase())
    const matchesDropoff = !dropoffFilter || load.delivery_location.toLowerCase().includes(dropoffFilter.toLowerCase())
    const matchesEquipment = !equipmentFilter || equipmentFilter === "all" || load.equipment_type === equipmentFilter
    const matchesLoadType = !loadTypeFilter || loadTypeFilter === "all" || load.load_type === loadTypeFilter
    
    const loadWeight = Number(load.weight)
    const matchesMinWeight = !minWeight || loadWeight >= Number.parseInt(minWeight)
    const matchesMaxWeight = !maxWeight || loadWeight <= Number.parseInt(maxWeight)
    
    const loadDate = new Date(load.pickup_date)
    const matchesStartDate = !startDate || loadDate >= new Date(startDate)
    const matchesEndDate = !endDate || loadDate <= new Date(endDate)
    
    const matchesSearch =
      !searchTerm ||
      load.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.delivery_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.load_type.toLowerCase().includes(searchTerm.toLowerCase())

    return (
      matchesOrigin &&
      matchesDropoff &&
      matchesEquipment &&
      matchesLoadType &&
      matchesMinWeight &&
      matchesMaxWeight &&
      matchesStartDate &&
      matchesEndDate &&
      matchesSearch &&
      load.status === "available"
    )
  })

  const handleViewDetails = (load: Load) => {
    setSelectedLoad(load)
    setIsDetailsDialogOpen(true)
  }

  const handlePhone = (load: Load) => {
    setSelectedLoad(load)
    setIsPhoneDialogOpen(true)
  }

  const handleMessage = (load: Load) => {
    setSelectedLoad(load)
    setIsMessageDialogOpen(true)
  }

  const handleNegotiate = (load: Load) => {
    setSelectedLoad(load)
    setCounterOffer(load.rate.toString())
    setIsNegotiateDialogOpen(true)
  }

  const handleSubmitNegotiation = async () => {
    if (!selectedLoad || !counterOffer) return

    if (!user) {
      showToastWithLogo({
      title: "Login Required",
      message: "Please log in to negotiate loads.",
      type: 'info'
    })
      return
    }

    const message = (document.getElementById('negotiationMessage') as HTMLTextAreaElement)?.value

    try {
      const response = await fetch('/api/loads/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadId: selectedLoad.id,
          negotiatorId: user.id,
          negotiatorName: `${user.firstName} ${user.lastName}`,
          negotiatorCompany: user.companyName,
          negotiatorRole: 'dispatcher',
          brokerId: selectedLoad.broker_id,
          brokerName: selectedLoad.broker_name,
          brokerCompany: selectedLoad.broker_company,
          originalRate: selectedLoad.rate,
          counterOffer: Number(counterOffer),
          message,
          pickupLocation: selectedLoad.pickup_location,
          deliveryLocation: selectedLoad.delivery_location
        })
      })

      if (response.ok) {
        const data = await response.json()
        showToastWithLogo({
        title: "Negotiation Sent!",
        message: `Sent to ${selectedLoad.broker_company}! Original: $${selectedLoad.rate.toLocaleString()}, Your Offer: $${Number(counterOffer).toLocaleString()}`,
        type: 'success'
      })
        setIsNegotiateDialogOpen(false)
        setSelectedLoad(null)
        setCounterOffer("")
      } else {
        showToastWithLogo({
        title: "Send Failed",
        message: "Failed to send negotiation. Please try again.",
        type: 'error'
      })
      }
    } catch (error) {
      console.error('Error submitting negotiation:', error)
      showToastWithLogo({
      title: "Error Occurred",
      message: "An error occurred. Please try again.",
      type: 'error'
    })
    }
  }
// information to be displayed when load is accepted 
  const handleAcceptLoad = async (load: Load) => {
    if (!user) {
      showToastWithLogo({
      title: "Login Required", 
      message: "Please log in to accept loads.",
      type: 'info'
    })
      return
    }

    if (!confirm(`Accept this load for $${load.rate.toLocaleString()}?`)) return

    try {
      const response = await fetch('/api/loads/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadId: load.id,
          acceptedById: user.id,
          acceptedByName: `${user.firstName} ${user.lastName}`,
          acceptedByCompany: user.companyName,
          acceptedByRole: 'dispatcher',
          acceptedByPhone: user.phone || 'Not provided', // ADD THIS to display phone #
          acceptedByMcNumber: 'MC-789012', // ADD THIS - Get from user profile in real app
          brokerId: load.broker_id,
          brokerName: load.broker_name,
          brokerCompany: load.broker_company,
          acceptedRate: load.rate,
          pickupLocation: load.pickup_location,
          deliveryLocation: load.delivery_location
        })
      })

      if (response.ok) {
        showToastWithLogo({
        title: "Load Accepted!",
        message: `Load ${load.id} accepted for $${load.rate.toLocaleString()}. The broker has been notified.`,
        type: 'success'
      })
        fetchLoads() // Refresh the load list
        setIsNegotiateDialogOpen(false)
        setSelectedLoad(null)
      } else {
        showToastWithLogo({
        title: "Accept Failed",
        message: "Failed to accept load. Please try again.",
        type: 'error'
      })
      }
    } catch (error) {
      console.error('Error accepting load:', error)
      showToastWithLogo({
      title: "Error Occurred",
      message: "An error occurred. Please try again.",
      type: 'error'
    })
    }
  }

  const getRatePerMile = (rate: number, distance: number) => {
    return distance > 0 ? (rate / distance).toFixed(2) : '0.00'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "booked":
        return "bg-blue-100 text-blue-800"
      case "in-transit":
        return "bg-yellow-100 text-yellow-800"
      case "delivered":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCounterOfferRatePerMile = () => {
    if (!selectedLoad || !counterOffer || !selectedLoad.distance) return "0.00"
    return (Number(counterOffer) / selectedLoad.distance).toFixed(2)
  }

  const clearFilters = () => {
    setOriginFilter("")
    setPickupRadius("50")
    setDropoffFilter("")
    setDropoffRadius("50")
    setEquipmentFilter("")
    setLoadTypeFilter("")
    setMinWeight("")
    setMaxWeight("")
    setStartDate("")
    setEndDate("")
    setSearchTerm("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available loads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Loads</h1>
          <p className="text-gray-600">{filteredLoads.length} available loads</p>
        </div>
        <Button variant="outline" onClick={fetchLoads}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Enhanced Search Form */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Location Filters */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Origin</label>
                  <LocationAutocomplete
                    placeholder="City, State or ZIP"
                    value={originFilter}
                    onChange={(value) => setOriginFilter(value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deadhead Radius</label>
                  <Select value={pickupRadius} onValueChange={setPickupRadius}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                      <SelectItem value="200">200 miles</SelectItem>
                      <SelectItem value="500">500 miles</SelectItem>
                      <SelectItem value="1000">1000 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Location</label>
                  <LocationAutocomplete
                    placeholder="City, State or ZIP"
                    value={dropoffFilter}
                    onChange={(value) => setDropoffFilter(value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Radius</label>
                  <Select value={dropoffRadius} onValueChange={setDropoffRadius}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                      <SelectItem value="200">200 miles</SelectItem>
                      <SelectItem value="500">500 miles</SelectItem>
                      <SelectItem value="1000">1000 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Load Details Filters */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Load Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Equipment Type</label>
                  <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Equipment</SelectItem>
                      <SelectItem value="16ft Box Truck">16ft Box Truck</SelectItem>
                      <SelectItem value="24ft Box Truck">24ft Box Truck</SelectItem>
                      <SelectItem value="26ft Box Truck">26ft Box Truck</SelectItem>
                      <SelectItem value="Box Truck Team">Box Truck Team</SelectItem>
                      <SelectItem value="Cargo Van">Cargo Van</SelectItem>
                      <SelectItem value="Sprinter Van">Sprinter Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Load Type</label>
                  <Select value={loadTypeFilter} onValueChange={setLoadTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select load type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Load Types</SelectItem>
                      <SelectItem value="FTL">FTL</SelectItem>
                      <SelectItem value="LTL">LTL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Weight Range (lbs)</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Min"
                      value={minWeight}
                      onChange={(e) => setMinWeight(e.target.value)}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={maxWeight}
                      onChange={(e) => setMaxWeight(e.target.value)}
                      type="number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="From"
                    />
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="To" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex space-x-2">
                <Button onClick={() => {}} className="bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search Loads
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Results */}
      <div className="grid gap-6">
        {filteredLoads.map((load) => (
          <Card key={load.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{load.load_type}</h3>
                    <p className="text-sm text-gray-600">{load.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>Posted by {load.broker_company}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{new Date(load.posted_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">${load.rate.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">${getRatePerMile(load.rate, load.distance)}/mile</div>
                  <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Pickup</div>
                    <div className="text-sm text-gray-600">{load.pickup_location}</div>
                    <div className="text-xs text-gray-500">{new Date(load.pickup_date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Delivery</div>
                    <div className="text-sm text-gray-600">{load.delivery_location}</div>
                    <div className="text-xs text-gray-500">{new Date(load.delivery_date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">{load.equipment_type}</div>
                    <div className="text-sm text-gray-600">{load.weight.toLocaleString()} lbs</div>
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
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(load)}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePhone(load)}>
                    Phone
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMessage(load)}>
                    Message
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                    onClick={() => handleAcceptLoad(load)}
                  >
                    Accept Load
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700" 
                    size="sm"
                    onClick={() => handleNegotiate(load)}
                  >
                    Negotiate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLoads.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loads found</h3>
            <p className="text-gray-600">
              {loads.length === 0
                ? "No available loads at the moment. Check back later for new opportunities."
                : "No loads match your search criteria. Try adjusting your filters."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Load Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Details</DialogTitle>
            <DialogDescription>Complete information for this load</DialogDescription>
          </DialogHeader>
          {selectedLoad && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Broker Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Company:</span> {selectedLoad.broker_company}
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span> {selectedLoad.broker_name}
                  </div>
                  <div>
                    <span className="font-medium">MC Number:</span> {selectedLoad.broker_mc}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Pickup Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Location:</span> {selectedLoad.pickup_location}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(selectedLoad.pickup_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Delivery Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Location:</span> {selectedLoad.delivery_location}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(selectedLoad.delivery_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Load Specifications</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Rate:</span> ${selectedLoad.rate.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Distance:</span> {selectedLoad.distance} miles
                  </div>
                  <div>
                    <span className="font-medium">Rate/Mile:</span> ${getRatePerMile(selectedLoad.rate, selectedLoad.distance)}
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span> {selectedLoad.weight.toLocaleString()} lbs
                  </div>
                  <div>
                    <span className="font-medium">Equipment:</span> {selectedLoad.equipment_type}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedLoad.load_type}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-medium">Description:</span> {selectedLoad.description}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handlePhone(selectedLoad)}>
                  Call Broker
                </Button>
                <Button variant="outline" onClick={() => handleMessage(selectedLoad)}>
                  Send Message
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsDetailsDialogOpen(false)
                    handleNegotiate(selectedLoad)
                  }}
                >
                  Negotiate Rate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Phone Dialog */}
      <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Broker</DialogTitle>
            <DialogDescription>Broker contact information</DialogDescription>
          </DialogHeader>
          {selectedLoad && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedLoad.broker_company}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Contact Person:</span> {selectedLoad.broker_name}
                  </div>
                  <div>
                    <span className="font-medium">MC Number:</span> {selectedLoad.broker_mc}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Load Reference</h5>
                <div className="text-sm">
                  <div>
                    {selectedLoad.pickup_location} → {selectedLoad.delivery_location}
                  </div>
                  <div>
                    Rate: ${selectedLoad.rate.toLocaleString()} | {selectedLoad.distance} miles
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPhoneDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Broker</DialogTitle>
            <DialogDescription>Send a message regarding this load</DialogDescription>
          </DialogHeader>
          {selectedLoad && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Load Information</h4>
                <div className="text-sm">
                  <div>
                    <span className="font-medium">Route:</span> {selectedLoad.pickup_location} →{" "}
                    {selectedLoad.delivery_location}
                  </div>
                  <div>
                    <span className="font-medium">Rate:</span> ${selectedLoad.rate.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Broker:</span> {selectedLoad.broker_company}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="w-full p-3 border rounded-md resize-none"
                  rows={4}
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    alert(`Message sent to ${selectedLoad.broker_company}!`)
                    setIsMessageDialogOpen(false)
                  }}
                >
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Negotiate Dialog */}
      <Dialog open={isNegotiateDialogOpen} onOpenChange={setIsNegotiateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Negotiate Load Rate</DialogTitle>
            <DialogDescription>Make a counter offer for this load</DialogDescription>
          </DialogHeader>
          {selectedLoad && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Load Summary</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Route:</span> {selectedLoad.pickup_location} →{" "}
                    {selectedLoad.delivery_location}
                  </div>
                  <div>
                    <span className="font-medium">Distance:</span> {selectedLoad.distance} miles
                  </div>
                  <div>
                    <span className="font-medium">Equipment:</span> {selectedLoad.equipment_type}
                  </div>
                  <div>
                    <span className="font-medium">Broker:</span> {selectedLoad.broker_company}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Original Rate</div>
                  <div className="text-2xl font-bold text-red-600">
                    ${selectedLoad.rate.toLocaleString()}
                  </div>
                  <div className="text-xs text-red-600">
                    ${getRatePerMile(selectedLoad.rate, selectedLoad.distance)}/mile
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Your Counter Offer</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${Number(counterOffer || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">${getCounterOfferRatePerMile()}/mile</div>
                </div>
              </div>

              <div>
                <Label htmlFor="counterOffer">Counter Offer Amount ($)</Label>
                <Input
                  id="counterOffer"
                  type="number"
                  value={counterOffer}
                  onChange={(e) => setCounterOffer(e.target.value)}
                  placeholder="Enter your counter offer"
                />
              </div>

              <div>
                <Label htmlFor="negotiationMessage">Message (Optional)</Label>
                <textarea
                  id="negotiationMessage"
                  className="w-full p-3 border rounded-md resize-none"
                  rows={3}
                  placeholder="Add a message to explain your counter offer..."
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleSubmitNegotiation}
                  disabled={!counterOffer || Number(counterOffer) <= 0}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  Send Counter Offer
                </Button>
                <Button
                  onClick={() => handleAcceptLoad(selectedLoad)}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  Accept Load at Original Rate
                </Button>
                <Button variant="outline" onClick={() => setIsNegotiateDialogOpen(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
     </div>
  )
} 