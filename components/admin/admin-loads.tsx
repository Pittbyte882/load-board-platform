"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, RefreshCw, MapPin, Calendar, DollarSign } from "lucide-react"

interface Load {
  id: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  distance: number
  weight: number
  rate: number
  status: string
  broker: string
  brokerName: string
  brokerCompany: string
  postedDate: string
  equipmentType: string
}

export function AdminLoads() {
  const [loads, setLoads] = useState<Load[]>([])
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchLoads()
  }, [])

  useEffect(() => {
    filterLoads()
  }, [loads, searchTerm, statusFilter])

  const fetchLoads = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/loads", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLoads(data)
      } else {
        console.error("Failed to fetch loads")
      }
    } catch (error) {
      console.error("Error fetching loads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterLoads = () => {
    let filtered = loads

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (load) =>
          load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          load.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          load.broker.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((load) => load.status === statusFilter)
    }

    setFilteredLoads(filtered)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "booked":
        return "bg-blue-100 text-blue-800"
      case "in-transit":
        return "bg-yellow-100 text-yellow-800"
      case "delivered":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Load Management</h2>
          <p className="text-gray-600">View all loads posted on the platform</p>
        </div>
        <Button variant="outline" onClick={fetchLoads} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by load ID, origin, destination, or broker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredLoads.length}</div>
            <p className="text-sm text-gray-600">Total Loads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {loads.filter((l) => l.status === "available").length}
            </div>
            <p className="text-sm text-gray-600">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {loads.filter((l) => l.status === "booked").length}
            </div>
            <p className="text-sm text-gray-600">Booked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {loads.filter((l) => l.status === "in-transit").length}
            </div>
            <p className="text-sm text-gray-600">In Transit</p>
          </CardContent>
        </Card>
      </div>

      {/* Loads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Loads</CardTitle>
          <CardDescription>View all loads posted by brokers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading loads...</p>
            </div>
          ) : filteredLoads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No loads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Load ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Pickup Date</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoads.map((load) => (
                    <TableRow key={load.id}>
                      <TableCell className="font-medium font-mono text-sm">{load.id}</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium">{load.origin}</div>
                            <div className="text-gray-600">→ {load.destination}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{load.brokerCompany}</div>
                          <div className="text-gray-600">{load.brokerName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{load.equipmentType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(load.pickupDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold text-green-600">
                          <DollarSign className="h-4 w-4" />
                          {load.rate.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{load.distance} mi</TableCell>
                      <TableCell>{load.weight.toLocaleString()} lbs</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(load.status)}>
                          {load.status.charAt(0).toUpperCase() + load.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{load.postedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}