"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Calendar, Package, Truck, Clock, Phone, Mail, Building } from "lucide-react"
import type { Load } from "@/lib/types"

export function LoadBoard() {
  const [loads, setLoads] = useState<Load[]>([])
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showNegotiateModal, setShowNegotiateModal] = useState(false)
  const [counterOffer, setCounterOffer] = useState("")

  // Search filters
  const [origin, setOrigin] = useState("")
  const [deadheadRadius, setDeadheadRadius] = useState("50")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [deliveryRadius, setDeliveryRadius] = useState("50")
  const [equipmentType, setEquipmentType] = useState("all")
  const [loadType, setLoadType] = useState("all")
  const [weightMin, setWeightMin] = useState("")
  const [weightMax, setWeightMax] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortBy, setSortBy] = useState("postedDate")

  const equipmentTypes = [
    "16ft Box Truck",
    "24ft Box Truck",
    "26ft Box Truck",
    "Box Truck (Reefer)",
    "Box Truck Team",
    "Cargo Van",
    "Sprinter Van",
  ]

  const radiusOptions = [
    { value: "25", label: "25 miles" },
    { value: "50", label: "50 miles" },
    { value: "100", label: "100 miles" },
    { value: "200", label: "200 miles" },
    { value: "500", label: "500 miles" },
    { value: "1000", label: "1000 miles" },
  ]

  useEffect(() => {
    fetchLoads()

    // Listen for new load posted events
    const handleLoadPosted = () => {
      console.log("Received loadPosted event, refreshing available loads...")
      fetchLoads()
    }

    window.addEventListener("loadPosted", handleLoadPosted)
    return () => window.removeEventListener("loadPosted", handleLoadPosted)
  }, [])

  useEffect(() => {
    filterAndSortLoads()
  }, [
    loads,
    origin,
    deadheadRadius,
    deliveryLocation,
    deliveryRadius,
    equipmentType,
    loadType,
    weightMin,
    weightMax,
    dateFrom,
    dateTo,
    sortBy,
  ])

  const fetchLoads = async () => {
    try {
      console.log("Fetching available loads for carriers...")
      const response = await fetch("/api/loads/available", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched available loads:", data.length)
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
      // Origin filter with deadhead radius (simplified - in real app would use geolocation)
      const matchesOrigin = !origin || load.pickupLocation.toLowerCase().includes(origin.toLowerCase())

      // Delivery location filter with delivery radius (simplified - in real app would use geolocation)
      const matchesDelivery =
        !deliveryLocation || load.deliveryLocation.toLowerCase().includes(deliveryLocation.toLowerCase())

      // Equipment type filter
      const matchesEquipment = equipmentType === "all" || load.equipmentType === equipmentType

      // Load type filter
      const matchesLoadType = loadType === "all" || load.loadType === loadType

      // Weight range filter
      const matchesWeight =
        (!weightMin || load.weight >= Number.parseInt(weightMin)) &&
        (!weightMax || load.weight <= Number.parseInt(weightMax))

      // Date range filter
      const matchesDateRange =
        (!dateFrom || new Date(load.pickupDate) >= new Date(dateFrom)) &&
        (!dateTo || new Date(load.pickupDate) <= new Date(dateTo))

      return (
        matchesOrigin && matchesDelivery && matchesEquipment && matchesLoadType && matchesWeight && matchesDateRange
      )
    })

    // Sort loads
filtered.sort((a, b) => {
  switch (sortBy) {
    case "rate":
      return b.rate - a.rate
    case "ratePerMile":
      const aRatePerMile = a.distance ? a.rate / a.distance : 0;
      const bRatePerMile = b.distance ? b.rate / b.distance : 0;
      return bRatePerMile - aRatePerMile;
    case "pickupDate":
      return new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime()
    case "distance":
      return (a.distance || 0) - (b.distance || 0);
    default: // postedDate
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  }
})
    setFilteredLoads(filtered)
  }

  const handleNegotiate = (load: Load) => {
    setSelectedLoad(load)
    setCounterOffer(load.rate.toString())
    setShowNegotiateModal(true)
  }

  const submitNegotiation = async () => {
    if (!selectedLoad || !counterOffer) return

    console.log(`Negotiating load ${selectedLoad.id} with counter offer: $${counterOffer}`)

    // In a real app, this would send the negotiation to the broker
    alert(
      `Negotiation sent to ${selectedLoad.brokerCompany}!\nOriginal Rate: $${selectedLoad.rate}\nYour Counter Offer: $${counterOffer}`,
    )

    setShowNegotiateModal(false)
    setSelectedLoad(null)
    setCounterOffer("")
  }

  const handleViewDetails = (load: Load) => {
    setSelectedLoad(load)
    setShowDetailsModal(true)
  }

  const handlePhone = (load: Load) => {
    // In a real app, this would initiate a call or show broker's phone number
    alert(`Calling ${load.brokerCompany}\nBroker: ${load.brokerName}\nLoad: ${load.id}`)
  }

  const handleMessage = (load: Load) => {
    // In a real app, this would open the messaging system
    alert(`Opening message thread with ${load.brokerCompany}\nBroker: ${load.brokerName}\nLoad: ${load.id}`)
  }

  const getLoadTypeColor = (loadType: string) => {
    return loadType === "FTL" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Find Loads</h1>
        <p className="text-gray-600">{filteredLoads.length} available loads</p>
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
                  <Input placeholder="City, State or ZIP" value={origin} onChange={(e) => setOrigin(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deadhead Radius</label>
                  <Select value={deadheadRadius} onValueChange={setDeadheadRadius}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {radiusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Location</label>
                  <Input
                    placeholder="City, State or ZIP"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Radius</label>
                  <Select value={deliveryRadius} onValueChange={setDeliveryRadius}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {radiusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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
                  <Select value={equipmentType} onValueChange={setEquipmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Equipment</SelectItem>
                      {equipmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Load Type</label>
                  <Select value={loadType} onValueChange={setLoadType}>
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
                      value={weightMin}
                      onChange={(e) => setWeightMin(e.target.value)}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={weightMax}
                      onChange={(e) => setWeightMax(e.target.value)}
                      type="number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="From"
                    />
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex space-x-2">
                <Button onClick={() => filterAndSortLoads()} className="bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search Loads
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOrigin("")
                    setDeadheadRadius("50")
                    setDeliveryLocation("")
                    setDeliveryRadius("50")
                    setEquipmentType("all")
                    setLoadType("all")
                    setWeightMin("")
                    setWeightMax("")
                    setDateFrom("")
                    setDateTo("")
                    setSortBy("postedDate")
                    setSelectedLoad(null)
                    setShowDetailsModal(false)
                    setShowNegotiateModal(false)
                    setCounterOffer("")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
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
                      <Badge variant="secondary">{load.equipmentType}</Badge>
                      <Badge className={getLoadTypeColor(load.loadType)}>{load.loadType}</Badge>
                      {load.expedited && <Badge variant="destructive">Expedited</Badge>}
                      {load.hazmat && <Badge variant="destructive">Hazmat</Badge>}
                      {load.teamDriver && <Badge variant="outline">Team Driver</Badge>}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${load.rate.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        ${load.distance ? (load.rate / load.distance).toFixed(2) : 'N/A'}/mile
                     </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">From</p>
                        <p className="text-lg font-semibold">{load.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">To</p>
                        <p className="text-lg font-semibold">{load.deliveryLocation}</p>
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
                        <p className="text-lg font-semibold">{load.brokerMC}</p>
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
                      <div>
                        <p className="text-sm text-gray-500">Broker</p>
                        <p className="font-medium">{load.brokerCompany}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Posted {formatDate(load.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 lg:w-48">
                  <Button onClick={() => handleViewDetails(load)} variant="outline" className="w-full">
                    View Details
                  </Button>
                  <Button onClick={() => handleNegotiate(load)} className="w-full bg-blue-600 hover:bg-blue-700">
                    Negotiate
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handlePhone(load)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleMessage(load)}
                    >
                      <Mail className="h-4 w-4" />
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
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loads available</h3>
            <p className="text-gray-500 mb-4">
              {loads.length === 0
                ? "There are currently no available loads. Check back later for new opportunities."
                : "No loads match your current filters. Try adjusting your search criteria."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Load Details Modal */}
      {showDetailsModal && selectedLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Load Details - {selectedLoad.id}</h2>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Broker Information</h3>
                  <p>
                    <strong>Company:</strong> {selectedLoad.brokerCompany}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedLoad.brokerName}
                  </p>
                  <p>
                    <strong>MC Number:</strong> {selectedLoad.brokerMC}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Load Information</h3>
                  <p>
                    <strong>Rate:</strong> ${selectedLoad.rate.toLocaleString()}
                  </p>
                  <strong>Rate/Mile:</strong> ${selectedLoad.distance ? (selectedLoad.rate / selectedLoad.distance).toFixed(2) : 'N/A'}
                  <p>
                    <strong>Equipment:</strong> {selectedLoad.equipmentType}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Pickup Details</h3>
                  <p>
                    <strong>Location:</strong> {selectedLoad.pickupLocation}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(selectedLoad.pickupDate)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Delivery Details</h3>
                  <p>
                    <strong>Location:</strong> {selectedLoad.deliveryLocation}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(selectedLoad.deliveryDate)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Load Details</h3>
                <p>
                  <strong>Weight:</strong> {selectedLoad.weight.toLocaleString()} lbs
                </p>
                <p>
                  <strong>Distance:</strong> {selectedLoad.distance} miles
                </p>
                <p>
                  <strong>Type:</strong> {selectedLoad.loadType}
                </p>
                <p>
                  <strong>Description:</strong> {selectedLoad.description}
                </p>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={() => handleNegotiate(selectedLoad)} className="bg-blue-600 hover:bg-blue-700">
                  Negotiate This Load
                </Button>
                <Button variant="outline" onClick={() => handlePhone(selectedLoad)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Broker
                </Button>
                <Button variant="outline" onClick={() => handleMessage(selectedLoad)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Message Broker
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Negotiate Modal */}
      {showNegotiateModal && selectedLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Negotiate Load - {selectedLoad.id}</h2>
              <Button variant="outline" onClick={() => setShowNegotiateModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Load Summary</h3>
                <p>
                  <strong>Route:</strong> {selectedLoad.pickupLocation} → {selectedLoad.deliveryLocation}
                </p>
                <p>
                  <strong>Distance:</strong> {selectedLoad.distance} miles
                </p>
                <p>
                  <strong>Equipment:</strong> {selectedLoad.equipmentType}
                </p>
                <p>
                  <strong>Broker's Rate:</strong> ${selectedLoad.rate.toLocaleString()}
                </p>
                <strong>Rate/Mile:</strong> ${selectedLoad.distance ? (selectedLoad.rate / selectedLoad.distance).toFixed(2) : 'N/A'}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Counter Offer ($)</label>
                <Input
                  type="number"
                  value={counterOffer}
                  onChange={(e) => setCounterOffer(e.target.value)}
                  placeholder="Enter your rate"
                  className="text-lg"
                />
                {counterOffer && (
                  <p className="text-sm text-gray-600 mt-1">
                    Rate per mile: ${selectedLoad.distance ? (Number(counterOffer) / selectedLoad.distance).toFixed(2) : 'N/A'}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button onClick={submitNegotiation} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Send Counter Offer
                </Button>
                <Button variant="outline" onClick={() => setShowNegotiateModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
