"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Truck, Star, Loader2 } from "lucide-react"

interface Carrier {
  id: string
  name: string
  email: string
  phone: string
  company: string
  equipmentType: string
  location: string
  mcNumber: string
  dotNumber: string
  rating: number
  completedLoads: number
  status: "active" | "inactive"
  joinedDate: string
  lastActive: string
}

const API_BASE_URL = '/api/carrier/manage-carriers'

export function ManageCarriers() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch carriers on component mount
  useEffect(() => {
    fetchCarriers()
  }, [])

  const fetchCarriers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch carriers')
      }
      
      const data = await response.json()
      setCarriers(data.carriers || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load carriers')
      console.error('Error fetching carriers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCarriers = carriers.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddCarrier = async (carrierData: Partial<Carrier>) => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...carrierData,
          rating: 0,
          completedLoads: 0,
          status: 'active',
          joinedDate: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add carrier')
      }

      const newCarrier = await response.json()
      setCarriers([...carriers, newCarrier])
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error('Error adding carrier:', err)
      alert('Failed to add carrier. Please try again.')
    }
  }

  const handleEditCarrier = async (carrierData: Partial<Carrier>) => {
    if (!selectedCarrier) return

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedCarrier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(carrierData),
      })

      if (!response.ok) {
        throw new Error('Failed to update carrier')
      }

      const updatedCarrier = await response.json()
      const updatedCarriers = carriers.map((carrier) =>
        carrier.id === selectedCarrier.id ? updatedCarrier : carrier,
      )
      setCarriers(updatedCarriers)
      setIsEditDialogOpen(false)
      setSelectedCarrier(null)
    } catch (err) {
      console.error('Error updating carrier:', err)
      alert('Failed to update carrier. Please try again.')
    }
  }

  const handleDeleteCarrier = async (carrierId: string) => {
    if (!confirm('Are you sure you want to delete this carrier?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${carrierId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete carrier')
      }

      setCarriers(carriers.filter((carrier) => carrier.id !== carrierId))
    } catch (err) {
      console.error('Error deleting carrier:', err)
      alert('Failed to delete carrier. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading carriers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Carriers</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchCarriers} className="bg-green-600 hover:bg-green-700">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Carriers</h1>
          <p className="text-gray-600">Add, edit, and manage your carrier network</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Carrier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Carrier</DialogTitle>
              <DialogDescription>Add a new carrier to your managed fleet</DialogDescription>
            </DialogHeader>
            <CarrierForm onSubmit={handleAddCarrier} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search carriers by name, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Button variant="outline" onClick={fetchCarriers}>
          <Loader2 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {filteredCarriers.map((carrier) => (
          <Card key={carrier.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/placeholder-icon.png?height=48&width=48&text=${carrier.name.charAt(0)}`} />
                    <AvatarFallback>{carrier.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{carrier.name}</h3>
                      <p className="text-sm text-gray-600">{carrier.company}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {carrier.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {carrier.email}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {carrier.location}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{carrier.equipmentType}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                        <span>
                          {carrier.rating.toFixed(1)} ({carrier.completedLoads} loads)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(carrier.status)}>{carrier.status}</Badge>
                  <Dialog
                    open={isEditDialogOpen && selectedCarrier?.id === carrier.id}
                    onOpenChange={(open) => {
                      setIsEditDialogOpen(open)
                      if (!open) setSelectedCarrier(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCarrier(carrier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Carrier</DialogTitle>
                        <DialogDescription>Update carrier information</DialogDescription>
                      </DialogHeader>
                      <CarrierForm initialData={selectedCarrier} onSubmit={handleEditCarrier} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCarrier(carrier.id)}
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

      {filteredCarriers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No carriers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "No carriers match your search criteria." : "Start by adding your first carrier."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Carrier
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CarrierForm({
  initialData,
  onSubmit,
}: {
  initialData?: Carrier | null
  onSubmit: (data: Partial<Carrier>) => void
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    equipmentType: initialData?.equipmentType || "Box Truck",
    location: initialData?.location || "",
    mcNumber: initialData?.mcNumber || "",
    dotNumber: initialData?.dotNumber || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mcNumber">MC Number</Label>
          <Input
            id="mcNumber"
            placeholder="MC-123456"
            value={formData.mcNumber}
            onChange={(e) => setFormData({ ...formData, mcNumber: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="dotNumber">DOT Number</Label>
          <Input
            id="dotNumber"
            placeholder="DOT-123456"
            value={formData.dotNumber}
            onChange={(e) => setFormData({ ...formData, dotNumber: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, State"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="equipmentType">Equipment Type</Label>
          <Select
            value={formData.equipmentType}
            onValueChange={(value) => setFormData({ ...formData, equipmentType: value })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Box Truck">Box Truck</SelectItem>
              <SelectItem value="Cargo Van">Cargo Van</SelectItem>
              <SelectItem value="Sprinter Van">Sprinter Van</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          onClick={handleSubmit} 
          className="bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {initialData ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>{initialData ? "Update Carrier" : "Add Carrier"}</>
          )}
        </Button>
      </div>
    </div>
  )
}