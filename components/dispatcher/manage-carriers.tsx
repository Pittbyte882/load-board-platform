"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Truck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  Building, 
  User,
  RefreshCw,
  AlertCircle
} from "lucide-react"

interface Carrier {
  id: string
  dispatcher_id: string
  carrier_name: string
  company_name: string
  home_city: string
  home_state: string
  mc_number: string
  dot_number: string
  company_phone: string
  cell_phone: string
  equipment_type: string
  status: string
  created_at: string
  updated_at: string
}

const EQUIPMENT_TYPES = [
  "Sprinter Van",
  "26' Box Truck",
  "20' Box Truck",
  "16' Box Truck",
  "Reefer Box Truck"
]

export function ManageCarriers() {
  const { user } = useAuth()
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = useState({
    carrier_name: "",
    company_name: "",
    home_city: "",
    home_state: "",
    mc_number: "",
    dot_number: "",
    company_phone: "",
    cell_phone: "",
    equipment_type: ""
  })

  useEffect(() => {
    if (user) {
      fetchCarriers()
    }
  }, [user])

  const fetchCarriers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/dispatcher/carriers", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCarriers(data)
      } else {
        console.error("Failed to fetch carriers:", response.status)
      }
    } catch (error) {
      console.error("Error fetching carriers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.carrier_name.trim()) {
      newErrors.carrier_name = "Carrier name is required"
    }
    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required"
    }
    if (!formData.home_city.trim()) {
      newErrors.home_city = "City is required"
    }
    if (!formData.home_state.trim()) {
      newErrors.home_state = "State is required"
    }
    if (!formData.mc_number.trim()) {
      newErrors.mc_number = "MC# is required"
    }
    if (!formData.dot_number.trim()) {
      newErrors.dot_number = "DOT# is required"
    }
    if (!formData.company_phone.trim()) {
      newErrors.company_phone = "Company phone is required"
    }
    if (!formData.cell_phone.trim()) {
      newErrors.cell_phone = "Cell phone is required"
    }
    if (!formData.equipment_type) {
      newErrors.equipment_type = "Equipment type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      carrier_name: "",
      company_name: "",
      home_city: "",
      home_state: "",
      mc_number: "",
      dot_number: "",
      company_phone: "",
      cell_phone: "",
      equipment_type: ""
    })
    setErrors({})
  }

  const handleAddCarrier = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/dispatcher/carriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCarriers()
        setIsAddDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add carrier")
      }
    } catch (error) {
      console.error("Error adding carrier:", error)
      alert("An error occurred while adding the carrier")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditCarrier = async () => {
    if (!validateForm() || !selectedCarrier) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/dispatcher/carriers/${selectedCarrier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCarriers()
        setIsEditDialogOpen(false)
        setSelectedCarrier(null)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update carrier")
      }
    } catch (error) {
      console.error("Error updating carrier:", error)
      alert("An error occurred while updating the carrier")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCarrier = async () => {
    if (!selectedCarrier) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/dispatcher/carriers/${selectedCarrier.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchCarriers()
        setIsDeleteDialogOpen(false)
        setSelectedCarrier(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete carrier")
      }
    } catch (error) {
      console.error("Error deleting carrier:", error)
      alert("An error occurred while deleting the carrier")
    } finally {
      setIsSaving(false)
    }
  }

  const openEditDialog = (carrier: Carrier) => {
    setSelectedCarrier(carrier)
    setFormData({
      carrier_name: carrier.carrier_name,
      company_name: carrier.company_name,
      home_city: carrier.home_city,
      home_state: carrier.home_state,
      mc_number: carrier.mc_number,
      dot_number: carrier.dot_number,
      company_phone: carrier.company_phone,
      cell_phone: carrier.cell_phone,
      equipment_type: carrier.equipment_type
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (carrier: Carrier) => {
    setSelectedCarrier(carrier)
    setIsDeleteDialogOpen(true)
  }

  const filteredCarriers = carriers.filter((carrier) => {
    const search = searchTerm.toLowerCase()
    return (
      carrier.carrier_name.toLowerCase().includes(search) ||
      carrier.company_name.toLowerCase().includes(search) ||
      carrier.mc_number.toLowerCase().includes(search) ||
      carrier.equipment_type.toLowerCase().includes(search) ||
      `${carrier.home_city} ${carrier.home_state}`.toLowerCase().includes(search)
    )
  })

  const getEquipmentIcon = (type: string) => {
    return <Truck className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Carriers</h2>
          <p className="text-gray-600">Add and manage carriers in your fleet</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchCarriers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, company, MC#, equipment, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Carriers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{carriers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active carriers in fleet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Equipment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(carriers.map(c => c.equipment_type)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">Different equipment types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(carriers.map(c => `${c.home_city}, ${c.home_state}`)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">Unique home bases</p>
          </CardContent>
        </Card>
      </div>

      {/* Carriers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCarriers.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {carriers.length === 0 ? "No Carriers Yet" : "No Results Found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {carriers.length === 0
                  ? "Start building your fleet by adding your first carrier."
                  : "Try adjusting your search terms."}
              </p>
              {carriers.length === 0 && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Carrier
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCarriers.map((carrier) => (
            <Card key={carrier.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                          <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{carrier.carrier_name}</h3>
                          <p className="text-sm text-gray-600">{carrier.company_name}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800" variant="secondary">
                        {carrier.equipment_type}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Home Base</div>
                          <div className="font-medium text-sm">
                            {carrier.home_city}, {carrier.home_state}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Building className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">MC# / DOT#</div>
                          <div className="font-medium text-sm">
                            {carrier.mc_number} / {carrier.dot_number}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Company Phone</div>
                          <div className="font-medium text-sm">{carrier.company_phone}</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Cell Phone</div>
                          <div className="font-medium text-sm">{carrier.cell_phone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Added Date */}
                    <div className="pt-2 text-xs text-gray-500">
                      Added: {new Date(carrier.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      onClick={() => openEditDialog(carrier)}
                      size="sm"
                      variant="outline"
                      className="w-20"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => openDeleteDialog(carrier)}
                      size="sm"
                      variant="outline"
                      className="w-20 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Carrier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Carrier</DialogTitle>
            <DialogDescription>Enter the carrier's information to add them to your fleet</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Personal Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carrier_name">
                    Carrier's Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="carrier_name"
                    value={formData.carrier_name}
                    onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
                    placeholder="John Doe"
                  />
                  {errors.carrier_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.carrier_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="company_name">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="ABC Trucking LLC"
                  />
                  {errors.company_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.company_name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Home Base Location</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="home_city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="home_city"
                    value={formData.home_city}
                    onChange={(e) => setFormData({ ...formData, home_city: e.target.value })}
                    placeholder="Los Angeles"
                  />
                  {errors.home_city && (
                    <p className="text-xs text-red-500 mt-1">{errors.home_city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="home_state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="home_state"
                    value={formData.home_state}
                    onChange={(e) => setFormData({ ...formData, home_state: e.target.value })}
                    placeholder="CA"
                    maxLength={2}
                  />
                  {errors.home_state && (
                    <p className="text-xs text-red-500 mt-1">{errors.home_state}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Authority Numbers */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Authority Numbers</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mc_number">
                    MC# <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mc_number"
                    value={formData.mc_number}
                    onChange={(e) => setFormData({ ...formData, mc_number: e.target.value })}
                    placeholder="MC123456"
                  />
                  {errors.mc_number && (
                    <p className="text-xs text-red-500 mt-1">{errors.mc_number}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dot_number">
                    DOT# <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dot_number"
                    value={formData.dot_number}
                    onChange={(e) => setFormData({ ...formData, dot_number: e.target.value })}
                    placeholder="DOT123456"
                  />
                  {errors.dot_number && (
                    <p className="text-xs text-red-500 mt-1">{errors.dot_number}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Contact Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_phone">
                    Company Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company_phone"
                    value={formData.company_phone}
                    onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                  {errors.company_phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.company_phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cell_phone">
                    Cell Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cell_phone"
                    value={formData.cell_phone}
                    onChange={(e) => setFormData({ ...formData, cell_phone: e.target.value })}
                    placeholder="(555) 987-6543"
                  />
                  {errors.cell_phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.cell_phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Equipment</h4>
              
              <div>
                <Label htmlFor="equipment_type">
                  Equipment Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.equipment_type}
                  onValueChange={(value) => setFormData({ ...formData, equipment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.equipment_type && (
                  <p className="text-xs text-red-500 mt-1">{errors.equipment_type}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCarrier}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? "Adding..." : "Add Carrier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Carrier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Carrier</DialogTitle>
            <DialogDescription>Update the carrier's information</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Same form fields as Add Dialog */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Personal Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_carrier_name">
                    Carrier's Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_carrier_name"
                    value={formData.carrier_name}
                    onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
                    placeholder="John Doe"
                  />
                  {errors.carrier_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.carrier_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit_company_name">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="ABC Trucking LLC"
                  />
                  {errors.company_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.company_name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Home Base Location</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_home_city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_home_city"
                    value={formData.home_city}
                    onChange={(e) => setFormData({ ...formData, home_city: e.target.value })}
                    placeholder="Los Angeles"
                  />
                  {errors.home_city && (
                    <p className="text-xs text-red-500 mt-1">{errors.home_city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit_home_state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_home_state"
                    value={formData.home_state}
                    onChange={(e) => setFormData({ ...formData, home_state: e.target.value })}
                    placeholder="CA"
                    maxLength={2}
                  />
                  {errors.home_state && (
                    <p className="text-xs text-red-500 mt-1">{errors.home_state}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Authority Numbers</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_mc_number">
                    MC# <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_mc_number"
                    value={formData.mc_number}
                    onChange={(e) => setFormData({ ...formData, mc_number: e.target.value })}
                    placeholder="MC123456"
                  />
                  {errors.mc_number && (
                    <p className="text-xs text-red-500 mt-1">{errors.mc_number}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit_dot_number">
                    DOT# <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_dot_number"
                    value={formData.dot_number}
                    onChange={(e) => setFormData({ ...formData, dot_number: e.target.value })}
                    placeholder="DOT123456"
                  />
                  {errors.dot_number && (
                    <p className="text-xs text-red-500 mt-1">{errors.dot_number}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Contact Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_company_phone">
                    Company Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_company_phone"
                    value={formData.company_phone}
                    onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                  {errors.company_phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.company_phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit_cell_phone">
                    Cell Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_cell_phone"
                    value={formData.cell_phone}
                    onChange={(e) => setFormData({ ...formData, cell_phone: e.target.value })}
                    placeholder="(555) 987-6543"
                  />
                  {errors.cell_phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.cell_phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Equipment</h4>
              
              <div>
                <Label htmlFor="edit_equipment_type">
                  Equipment Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.equipment_type}
                  onValueChange={(value) => setFormData({ ...formData, equipment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.equipment_type && (
                  <p className="text-xs text-red-500 mt-1">{errors.equipment_type}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setSelectedCarrier(null)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleEditCarrier}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? "Updating..." : "Update Carrier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Carrier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this carrier? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCarrier && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">{selectedCarrier.carrier_name}</p>
                  <p className="text-sm text-red-700">{selectedCarrier.company_name}</p>
                  <p className="text-sm text-red-700">{selectedCarrier.equipment_type}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false)
              setSelectedCarrier(null)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCarrier}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSaving ? "Deleting..." : "Delete Carrier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
