"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck as TruckIcon, Plus, Search, Calendar, MapPin, Edit, Trash2, RefreshCw, FileText } from 'lucide-react'
import { PostTruckForm } from "./post-truck-form"
import { Truck } from "@/lib/types"

export function PostTruck() {
  const [showForm, setShowForm] = useState(false)
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [filteredTrucks, setFilteredTrucks] = useState<Truck[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMyTrucks()
  }, [])

  useEffect(() => {
    filterTrucks()
  }, [trucks, searchTerm, statusFilter])

  const fetchMyTrucks = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching my trucks...')
      const response = await fetch('/api/trucks/my-trucks', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched trucks:', data)
        setTrucks(data)
      } else {
        console.error('Failed to fetch trucks:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Error fetching trucks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTrucks = () => {
    let filtered = trucks

    if (searchTerm) {
      filtered = filtered.filter(truck =>
        truck.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.equipmentType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(truck => truck.status === statusFilter)
    }

    setFilteredTrucks(filtered)
  }

  const handleTruckPosted = () => {
    console.log('Truck posted, refreshing list...')
    // Refresh the truck list when a new truck is posted
    fetchMyTrucks()
  }

  const handleDeleteTruck = async (truckId: string) => {
    if (confirm('Are you sure you want to delete this truck posting?')) {
      try {
        const response = await fetch(`/api/trucks/${truckId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setTrucks(trucks.filter(truck => truck.id !== truckId))
        }
      } catch (error) {
        console.error('Error deleting truck:', error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'booked':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (showForm) {
    return (
      <PostTruckForm 
        onBack={() => setShowForm(false)} 
        onTruckPosted={handleTruckPosted}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Post Truck</h2>
          <p className="text-gray-600">Manage your available trucks for brokers to find</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMyTrucks} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Post New Truck
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by city, state, or truck type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trucks List */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your trucks...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredTrucks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trucks found</h3>
              <p className="text-gray-600 mb-4">
                {trucks.length === 0 
                  ? "You haven't posted any trucks yet. Start by posting your first truck!"
                  : "No trucks match your current search criteria."
                }
              </p>
              {trucks.length === 0 && (
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post Your First Truck
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTrucks.map((truck) => (
            <Card key={truck.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TruckIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">{truck.equipmentType}</h3>
                      <Badge className={getStatusColor(truck.status)}>
                        {truck.status.charAt(0).toUpperCase() + truck.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{truck.city}, {truck.state}</span>
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

                    {truck.description && (
                      <p className="text-gray-600 text-sm mb-4">{truck.description}</p>
                    )}

                    <div className="text-xs text-gray-500">
                      Posted: {new Date(truck.postedDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteTruck(truck.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {!isLoading && trucks.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              Showing {filteredTrucks.length} of {trucks.length} trucks
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
