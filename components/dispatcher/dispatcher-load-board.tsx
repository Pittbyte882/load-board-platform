"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Package, Truck, Clock, Search } from "lucide-react"
import type { Load, Carrier } from "@/lib/types"

const mockLoads: Load[] = [
  {
    id: "1",
    brokerId: "broker-1",
    brokerName: "John Smith",
    brokerCompany: "ABC Logistics",
    brokerMC: "MC-123456",
    title: "Furniture Delivery",
    description: "Furniture and household goods delivery",
    pickupLocation: "Atlanta, GA",
    deliveryLocation: "Miami, FL",
    pickupDate: "2024-01-20T08:00:00Z",
    deliveryDate: "2024-01-22T17:00:00Z",
    postedDate: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    rate: 1200,
    distance: 650,
    weight: 2500,
    loadType: "FTL",
    equipmentType: "Box Truck",
    status: "available",
  },
  {
    id: "2",
    brokerId: "broker-2",
    brokerName: "Sarah Johnson",
    brokerCompany: "Tech Distributors",
    brokerMC: "MC-789012",
    title: "Electronics Delivery",
    description: "Computer equipment delivery",
    pickupLocation: "Houston, TX",
    deliveryLocation: "Dallas, TX",
    pickupDate: "2024-01-18T09:00:00Z",
    deliveryDate: "2024-01-18T16:00:00Z",
    postedDate: "2024-01-15T14:30:00Z",
    createdAt: "2024-01-15T14:30:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    rate: 450,
    distance: 240,
    weight: 1800,
    loadType: "FTL",
    equipmentType: "Cargo Van",
    status: "available",
  },
  {
    id: "3",
    brokerId: "broker-3",
    brokerName: "Mike Davis",
    brokerCompany: "Retail Solutions",
    brokerMC: "MC-345678",
    title: "Retail Merchandise",
    description: "Store merchandise and displays",
    pickupLocation: "Phoenix, AZ",
    deliveryLocation: "Las Vegas, NV",
    pickupDate: "2024-01-25T10:00:00Z",
    deliveryDate: "2024-01-26T15:00:00Z",
    postedDate: "2024-01-14T09:15:00Z",
    createdAt: "2024-01-14T09:15:00Z",
    updatedAt: "2024-01-14T09:15:00Z",
    rate: 800,
    distance: 300,
    weight: 3200,
    loadType: "LTL",
    equipmentType: "Box Truck",
    status: "available",
  },
]

const mockCarriers: Carrier[] = [
  {
    id: "1",
    name: "Mike Johnson",
    company: "Johnson Transport",
    equipmentType: "Box Truck",
    location: "Atlanta, GA",
    rating: 4.8,
    completedLoads: 156,
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Davis",
    company: "Davis Delivery",
    equipmentType: "Cargo Van",

    location: "Miami, FL",
    rating: 4.9,
    completedLoads: 203,
    status: "active",
  },
]

export function DispatcherLoadBoard() {
  const [loads, setLoads] = useState<Load[]>(mockLoads)
  const [carriers] = useState<Carrier[]>(mockCarriers)
  const [searchTerm, setSearchTerm] = useState("")
  const [originFilter, setOriginFilter] = useState("")
  const [pickupRadius, setPickupRadius] = useState("25") // Updated default value
  const [dropoffFilter, setDropoffFilter] = useState("")
  const [dropoffRadius, setDropoffRadius] = useState("25") // Updated default value
  const [loadTypeFilter, setLoadTypeFilter] = useState("")
  const [minWeight, setMinWeight] = useState("")
  const [maxWeight, setMaxWeight] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [equipmentFilter, setEquipmentFilter] = useState("") // Declared the variable

  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [selectedCarrier, setSelectedCarrier] = useState<string>("")
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isNegotiateDialogOpen, setIsNegotiateDialogOpen] = useState(false)
  const [counterOffer, setCounterOffer] = useState("")
  const [selectedLoadForDetails, setSelectedLoadForDetails] = useState<Load | null>(null)
  const [selectedLoadForPhone, setSelectedLoadForPhone] = useState<Load | null>(null)
  const [selectedLoadForMessage, setSelectedLoadForMessage] = useState<Load | null>(null)
  const [selectedLoadForNegotiate, setSelectedLoadForNegotiate] = useState<Load | null>(null)

  const filteredLoads = loads.filter((load) => {
    // Origin filter
    const matchesOrigin = !originFilter || load.pickupLocation.toLowerCase().includes(originFilter.toLowerCase())

    // Drop off filter
    const matchesDropoff = !dropoffFilter || load.deliveryLocation.toLowerCase().includes(dropoffFilter.toLowerCase())

    // Equipment filter
    const matchesEquipment = !equipmentFilter || load.equipmentType === equipmentFilter

    // Load type filter
    const matchesLoadType = !loadTypeFilter || load.loadType === loadTypeFilter

    // Weight filter
    const loadWeight = Number(load.weight)
    const matchesMinWeight = !minWeight || loadWeight >= Number.parseInt(minWeight)
    const matchesMaxWeight = !maxWeight || loadWeight <= Number.parseInt(maxWeight)

    // Date filter
    const loadDate = new Date(load.pickupDate)
    const matchesStartDate = !startDate || loadDate >= new Date(startDate)
    const matchesEndDate = !endDate || loadDate <= new Date(endDate)

    // General search
    const matchesSearch =
      !searchTerm ||
      load.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.loadType.toLowerCase().includes(searchTerm.toLowerCase())

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

  const handleBookLoad = () => {
    if (!selectedLoad || !selectedCarrier) return

    const carrier = carriers.find((c) => c.id === selectedCarrier)
    if (!carrier) return

    // Update load status
    setLoads(
      loads.map((load) =>
        load.id === selectedLoad.id ? { ...load, status: "booked", assignedCarrier: carrier.name } : load,
      ),
    )

    setIsBookingDialogOpen(false)
    setSelectedLoad(null)
    setSelectedCarrier("")
  }

  const handleViewDetails = (load: Load) => {
    setSelectedLoadForDetails(load)
    setIsDetailsDialogOpen(true)
  }

  const handlePhone = (load: Load) => {
    setSelectedLoadForPhone(load)
    setIsPhoneDialogOpen(true)
  }

  const handleMessage = (load: Load) => {
    setSelectedLoadForMessage(load)
    setIsMessageDialogOpen(true)
  }

  const handleNegotiate = (load: Load) => {
    setSelectedLoadForNegotiate(load)
    setCounterOffer(load.rate.toString())
    setIsNegotiateDialogOpen(true)
  }

  const handleSubmitNegotiation = () => {
    if (!selectedLoadForNegotiate || !counterOffer) return

    alert(
      `Negotiation sent to ${selectedLoadForNegotiate.brokerCompany}!\nOriginal Rate: $${selectedLoadForNegotiate.rate.toLocaleString()}\nYour Counter Offer: $${Number(counterOffer).toLocaleString()}`,
    )

    setIsNegotiateDialogOpen(false)
    setSelectedLoadForNegotiate(null)
    setCounterOffer("")
  }

  const getRatePerMile = (rate: number, distance: number) => {
    return (rate / distance).toFixed(2)
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
  if (!selectedLoadForNegotiate || !counterOffer || !selectedLoadForNegotiate.distance) return "0.00"
  return (Number(counterOffer) / selectedLoadForNegotiate.distance).toFixed(2)
}

  const handleSearch = () => {
    // The filtering happens automatically through the filteredLoads computed value
    console.log("Searching with filters:", {
      origin: originFilter,
      pickupRadius,
      dropoff: dropoffFilter,
      dropoffRadius,
      equipment: equipmentFilter,
      loadType: loadTypeFilter,
      minWeight,
      maxWeight,
      startDate,
      endDate,
    })
  }

  const clearFilters = () => {
    setOriginFilter("")
    setPickupRadius("")
    setDropoffFilter("")
    setDropoffRadius("")
    setEquipmentFilter("") // Used the declared variable
    setLoadTypeFilter("")
    setMinWeight("")
    setMaxWeight("")
    setStartDate("")
    setEndDate("")
    setSearchTerm("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Loads</h1>
          <p className="text-gray-600">Search and book loads for your carriers</p>
        </div>
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
                  <Input
                    placeholder="City, State or ZIP"
                    value={originFilter}
                    onChange={(e) => setOriginFilter(e.target.value)}
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
                  <Input
                    placeholder="City, State or ZIP"
                    value={dropoffFilter}
                    onChange={(e) => setDropoffFilter(e.target.value)}
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
                      <SelectItem value="Box Truck (Reefer)">Box Truck (Reefer)</SelectItem>
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
                <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search Loads
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
              <Select value="postedDate" onValueChange={() => {}}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postedDate">Newest First</SelectItem>
                  <SelectItem value="rate">Highest Rate</SelectItem>
                  <SelectItem value="ratePerMile">Best Rate/Mile</SelectItem>
                  <SelectItem value="pickupDate">Pickup Date</SelectItem>
                  <SelectItem value="distance">Shortest Distance</SelectItem>
                </SelectContent>
              </Select>
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
                    <h3 className="text-lg font-semibold text-gray-900">{load.loadType}</h3>
                    <p className="text-sm text-gray-600">{load.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>Posted by {load.brokerCompany}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{new Date(load.postedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">${load.rate.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">${load.distance ? getRatePerMile(load.rate, load.distance) : '0.00'}/mile</div>
                  <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Pickup</div>
                    <div className="text-sm text-gray-600">{load.pickupLocation}</div>
                    <div className="text-xs text-gray-500">{load.pickupDate}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Delivery</div>
                    <div className="text-sm text-gray-600">{load.deliveryLocation}</div>
                    <div className="text-xs text-gray-500">{load.deliveryDate}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">{load.equipmentType}</div>
                    <div className="text-sm text-gray-600">{load.weight}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{load.distance} miles</span>
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
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleNegotiate(load)}>
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
              {searchTerm ||
              originFilter ||
              dropoffFilter ||
              equipmentFilter ||
              loadTypeFilter ||
              minWeight ||
              maxWeight ||
              startDate ||
              endDate
                ? "No loads match your search criteria. Try adjusting your filters."
                : "No available loads at the moment. Check back later for new opportunities."}
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
          {selectedLoadForDetails && (
            <div className="space-y-6">
              {/* Broker Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Broker Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Company:</span> {selectedLoadForDetails.brokerCompany}
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span> John Smith
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> (555) 123-4567
                  </div>
                  <div>
                    <span className="font-medium">MC Number:</span> MC-123456
                  </div>
                </div>
              </div>

              {/* Load Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Pickup Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Location:</span> {selectedLoadForDetails.pickupLocation}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(selectedLoadForDetails.pickupDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> 8:00 AM - 5:00 PM
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Delivery Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Location:</span> {selectedLoadForDetails.deliveryLocation}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(selectedLoadForDetails.deliveryDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> 8:00 AM - 5:00 PM
                    </div>
                  </div>
                </div>
              </div>

              {/* Load Specifications */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Load Specifications</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Rate:</span> ${selectedLoadForDetails.rate.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Distance:</span> {selectedLoadForDetails.distance} miles
                  </div>
                  <div>
                    <span className="font-medium">Rate/Mile:</span> $
                    {selectedLoadForDetails.distance ? getRatePerMile(selectedLoadForDetails.rate, selectedLoadForDetails.distance) : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span> {selectedLoadForDetails.weight}
                  </div>
                  <div>
                    <span className="font-medium">Equipment:</span> {selectedLoadForDetails.equipmentType}
                  </div>
                </div>
              </div>

            
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handlePhone(selectedLoadForDetails)}>
                  Call Broker
                </Button>
                <Button variant="outline" onClick={() => handleMessage(selectedLoadForDetails)}>
                  Send Message
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleNegotiate(selectedLoadForDetails)}
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
          {selectedLoadForPhone && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedLoadForPhone.brokerCompany}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Contact Person:</span> John Smith
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> (555) 123-4567
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> john@
                    {selectedLoadForPhone.brokerCompany.toLowerCase().replace(/\s+/g, "")}.com
                  </div>
                  <div>
                    <span className="font-medium">MC Number:</span> MC-123456
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Load Reference</h5>
                <div className="text-sm">
                  <div>
                    {selectedLoadForPhone.pickupLocation} → {selectedLoadForPhone.deliveryLocation}
                  </div>
                  <div>
                    Rate: ${selectedLoadForPhone.rate.toLocaleString()} | {selectedLoadForPhone.distance} miles
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPhoneDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    window.open("tel:+15551234567", "_self")
                    setIsPhoneDialogOpen(false)
                  }}
                >
                  Call Now
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
          {selectedLoadForMessage && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Load Information</h4>
                <div className="text-sm">
                  <div>
                    <span className="font-medium">Route:</span> {selectedLoadForMessage.pickupLocation} →{" "}
                    {selectedLoadForMessage.deliveryLocation}
                  </div>
                  <div>
                    <span className="font-medium">Rate:</span> ${selectedLoadForMessage.rate.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Broker:</span> {selectedLoadForMessage.brokerCompany}
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
                    alert(`Message sent to ${selectedLoadForMessage.brokerCompany}!`)
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negotiate Load Rate</DialogTitle>
            <DialogDescription>Make a counter offer for this load</DialogDescription>
          </DialogHeader>
          {selectedLoadForNegotiate && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Load Summary</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Route:</span> {selectedLoadForNegotiate.pickupLocation} →{" "}
                    {selectedLoadForNegotiate.deliveryLocation}
                  </div>
                  <div>
                    <span className="font-medium">Distance:</span> {selectedLoadForNegotiate.distance} miles
                  </div>
                  <div>
                    <span className="font-medium">Equipment:</span> {selectedLoadForNegotiate.equipmentType}
                  </div>
                  <div>
                    <span className="font-medium">Broker:</span> {selectedLoadForNegotiate.brokerCompany}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Original Rate</div>
                  <div className="text-lg font-bold text-red-600">
                    ${selectedLoadForNegotiate.rate.toLocaleString()}
                  </div>
                  <div className="text-xs text-red-600">
                    ${selectedLoadForNegotiate.distance ? getRatePerMile(selectedLoadForNegotiate.rate, selectedLoadForNegotiate.distance) : 'N/A'}/mile
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Your Counter Offer</div>
                  <div className="text-lg font-bold text-green-600">${Number(counterOffer || 0).toLocaleString()}</div>
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

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsNegotiateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitNegotiation}
                  disabled={!counterOffer || Number(counterOffer) <= 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Send Counter Offer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
