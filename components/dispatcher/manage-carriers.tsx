"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Truck, Star } from "lucide-react"
import type { Carrier } from "@/lib/types"

const mockCarriers: Carrier[] = [
  {
    id: "1",
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "(555) 123-4567",
    company: "Johnson Transport",
    equipmentType: "Box Truck",
    location: "Atlanta, GA",
    mcNumber: "MC-123456",
    dotNumber: "DOT-123456",
    rating: 4.8,
    completedLoads: 156,
    status: "active",
    joinedDate: "2023-01-15",
    lastActive: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Sarah Davis",
    email: "sarah@example.com",
    phone: "(555) 987-6543",
    company: "Davis Delivery",
    equipmentType: "Cargo Van",
    location: "Miami, FL",
    mcNumber: "MC-987654",
    dotNumber: "DOT-987654",
    rating: 4.9,
    completedLoads: 203,
    status: "active",
    joinedDate: "2022-11-08",
    lastActive: "2024-01-15T09:15:00Z",
  },
  {
    id: "3",
    name: "Carlos Rodriguez",
    email: "carlos@example.com",
    phone: "(555) 456-7890",
    company: "Rodriguez Logistics",
    equipmentType: "Box Truck",
    location: "Houston, TX",
    mcNumber: "MC-456789",
    dotNumber: "DOT-456789",
    rating: 4.6,
    completedLoads: 89,
    status: "inactive",
    joinedDate: "2023-06-22",
    lastActive: "2024-01-10T14:20:00Z",
  },
]

export function ManageCarriers() {
  const [carriers, setCarriers] = useState<Carrier[]>(mockCarriers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredCarriers = carriers.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddCarrier = (carrierData: Partial<Carrier>) => {
    const newCarrier: Carrier = {
      id: Date.now().toString(),
      name: carrierData.name || "",
      email: carrierData.email || "",
      phone: carrierData.phone || "",
      company: carrierData.company || "",
      equipmentType: carrierData.equipmentType || "Box Truck",
      location: carrierData.location || "",
      mcNumber: carrierData.mcNumber || "",
      dotNumber: carrierData.dotNumber || "",
      rating: 0,
      completedLoads: 0,
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString(),
    }
    setCarriers([...carriers, newCarrier])
    setIsAddDialogOpen(false)
  }

  const handleEditCarrier = (carrierData: Partial<Carrier>) => {
    if (!selectedCarrier) return

    const updatedCarriers = carriers.map((carrier) =>
      carrier.id === selectedCarrier.id ? { ...carrier, ...carrierData } : carrier,
    )
    setCarriers(updatedCarriers)
    setIsEditDialogOpen(false)
    setSelectedCarrier(null)
  }

  const handleDeleteCarrier = (carrierId: string) => {
    setCarriers(carriers.filter((carrier) => carrier.id !== carrierId))
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
    vehicleType: initialData?.equipmentType || "Box Truck",
    location: initialData?.location || "",
    mcNumber: initialData?.mcNumber || "",
    dotNumber: initialData?.dotNumber || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
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
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
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
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select
            value={formData.vehicleType}
            onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
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
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {initialData ? "Update Carrier" : "Add Carrier"}
        </Button>
      </div>
    </form>
  )
}
