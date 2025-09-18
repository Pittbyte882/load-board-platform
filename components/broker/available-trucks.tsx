"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationAutocomplete } from "@/components/ui/location-autocomplete"
import { Truck, Search, Calendar, MapPin, Phone, MessageCircle, RefreshCw, FileText } from "lucide-react"
import type { Truck as equipmentType } from "@/lib/types"

export function AvailableTrucks() {
  const [trucks, setTrucks] = useState<equipmentType[]>([])
  const [filteredTrucks, setFilteredTrucks] = useState<equipmentType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [truckTypeFilter, setTruckTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAvailableTrucks()
  }, [])

  useEffect(() => {
    filterTrucks()
  }, [trucks, searchTerm, stateFilter, truckTypeFilter])

  const fetchAvailableTrucks = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching available trucks...")
      const response = await fetch("/api/trucks/available", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched available trucks:", data)
        setTrucks(data)
      } else {
        console.error("Failed to fetch available trucks:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching available trucks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTrucks = () => {
    let filtered = trucks

    if (searchTerm) {
      filtered = filtered.filter(
        (truck) =>
          truck.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          truck.carrierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          truck.carrierCompany.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (stateFilter !== "all") {
      filtered = filtered.filter((truck) => truck.state === stateFilter)
    }

    if (truckTypeFilter !== "all") {
      filtered = filtered.filter((truck) => truck.equipmentType === truckTypeFilter)
    }

    setFilteredTrucks(filtered)
  }

  const handleMessage = (truck: equipmentType) => {
    // Dispatch event to switch to Messages tab and compose new message
    const event = new CustomEvent("dashboardTabChange", {
      detail: {
        tab: "messages",
        action: "compose",
        recipient: truck.carrierName,
        company: truck.carrierCompany,
        loadId: null,
      },
    })
    window.dispatchEvent(event)
  }

  const handleContact = (truck: equipmentType) => {
    // Handle contact action - could open phone dialer or show contact info
    console.log("Contacting carrier:", truck.carrierName)
    if (truck.phone) {
      window.open(`tel:${truck.phone}`)
    } else {
      alert(`Contact ${truck.carrierName} at ${truck.carrierCompany}`)
    }
  }

  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ]

  const equipmentType = [
    "16ft Box Truck",
    "24ft Box Truck",
    "26ft Box Truck",
    "Box Truck Team",
    "Cargo Van",
    "Sprinter Van",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Available Trucks</h2>
          <p className="text-gray-600">Find trucks available for your loads</p>
        </div>
        <Button variant="outline" onClick={fetchAvailableTrucks} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LocationAutocomplete
             placeholder="Search by city (e.g., Chicago, IL)"
             value={searchTerm}
             onChange={(value) => setSearchTerm(value)}
            />
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={truckTypeFilter} onValueChange={setTruckTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by truck type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Truck Types</SelectItem>
                {equipmentType.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">{filteredTrucks.length} trucks available</div>
          </div>
        </CardContent>
      </Card>

      {/* Trucks List */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading available trucks...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredTrucks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trucks available</h3>
              <p className="text-gray-600">
                {trucks.length === 0
                  ? "No trucks are currently available. Check back later!"
                  : "No trucks match your current search criteria."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTrucks.map((truck) => (
            <Card key={truck.id} className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Truck className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">{truck.equipmentType}</h3>
                      <Badge className="bg-green-100 text-green-800">Available</Badge>
                    </div>

                    <div className="mb-3">
                      <p className="font-medium text-gray-900">{truck.carrierCompany}</p>
                      <p className="text-sm text-gray-600">Carrier: {truck.carrierName}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {truck.city}, {truck.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Available: {new Date(truck.availableDate).toLocaleDateString()}</span>
                      </div>
                      {truck.capacity && (
                        <div className="text-gray-600">
                          <span>Capacity: {truck.capacity.toLocaleString()} lbs</span>
                        </div>
                      )}
                    </div>

                    {/* DOT and MC Numbers */}
                    {(truck.dotNumber || truck.mcNumber) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {truck.dotNumber && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>DOT: {truck.dotNumber}</span>
                          </div>
                        )}
                        {truck.mcNumber && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>MC: {truck.mcNumber}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {truck.specialEquipment && truck.specialEquipment.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Special Equipment:</p>
                        <div className="flex flex-wrap gap-2">
                          {truck.specialEquipment.map((equipment) => (
                            <Badge key={equipment} variant="outline" className="text-xs">
                              {equipment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {truck.description && <p className="text-gray-600 text-sm mb-4">{truck.description}</p>}

                    <div className="text-xs text-gray-500">
                      Posted: {new Date(truck.postedDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" className="flex items-center gap-2" onClick={() => handleMessage(truck)}>
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => handleContact(truck)}
                    >
                      <Phone className="h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
