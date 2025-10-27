"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationAutocomplete } from "@/components/ui/location-autocomplete"
import { ArrowLeft, Truck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface PostTruckFormProps {
  onBack: () => void
  onTruckPosted: () => void
}

export function PostTruckForm({ onBack, onTruckPosted }: PostTruckFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    carrierName: "",
    carrierCompany: "",
    equipmentType: "",
    availableDate: "",
    city: "",
    state: "",
    capacity: "",
    dotNumber: "",
    mcNumber: "",
    specialEquipment: [] as string[],
    description: "",
    phone: "",
  })

  const equipmentTypes = [
    "16ft Box Truck",
    "24ft Box Truck",
    "26ft Box Truck",
    "Box Truck Team",
    "Cargo Van",
    "Sprinter Van",
  ]

  const specialEquipmentOptions = [
    "Lift Gate",
    "Pallet Jack",
    "Straps & Blankets",
    "Climate Control",
    "GPS Tracking",
    "Real-time Updates",
  ]

  const handleLocationChange = (value: string) => {
    // Parse "City, ST" format
    const parts = value.split(',').map(p => p.trim())
    if (parts.length === 2) {
      setFormData(prev => ({
        ...prev,
        city: parts[0],
        state: parts[1]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        city: value,
        state: ''
      }))
    }
  }

  const handleSpecialEquipmentToggle = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      specialEquipment: prev.specialEquipment.includes(equipment)
        ? prev.specialEquipment.filter((e) => e !== equipment)
        : [...prev.specialEquipment, equipment],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/trucks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carrierName: formData.carrierName,
          carrierCompany: formData.carrierCompany,
          equipmentType: formData.equipmentType,
          availableDate: formData.availableDate,
          city: formData.city,
          state: formData.state,
          capacity: formData.capacity,
          dotNumber: formData.dotNumber,
          mcNumber: formData.mcNumber,
          specialEquipment: formData.specialEquipment,
          description: formData.description,
          phone: formData.phone,
          postedByRole: user?.role || 'dispatcher',
        }),
      })

      if (response.ok) {
        alert("Truck posted successfully!")
        onTruckPosted()
        onBack()
      } else {
        const error = await response.json()
        alert(`Failed to post truck: ${error.error}`)
      }
    } catch (error) {
      console.error("Error posting truck:", error)
      alert("Failed to post truck. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Post Available Truck</h2>
          <p className="text-gray-600">List a truck for brokers to find</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Truck Details</CardTitle>
          <CardDescription>Provide information about the available truck</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Carrier Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Carrier Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carrierName">Carrier Name *</Label>
                  <Input
                    id="carrierName"
                    value={formData.carrierName}
                    onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carrierCompany">Carrier Company *</Label>
                  <Input
                    id="carrierCompany"
                    value={formData.carrierCompany}
                    onChange={(e) => setFormData({ ...formData, carrierCompany: e.target.value })}
                    placeholder="ABC Transport"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Truck Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Truck Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentType">Equipment Type *</Label>
                  <Select
                    value={formData.equipmentType}
                    onValueChange={(value) => setFormData({ ...formData, equipmentType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment type" />
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
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (lbs)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>

            {/* Location & Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location & Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Current Location *</Label>
                  <LocationAutocomplete
                    placeholder="Chicago, IL"
                    value={formData.city ? `${formData.city}, ${formData.state}` : ""}
                    onChange={handleLocationChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableDate">Available Date *</Label>
                  <Input
                    id="availableDate"
                    type="date"
                    value={formData.availableDate}
                    onChange={(e) => setFormData({ ...formData, availableDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
            </div>

            {/* DOT & MC Numbers */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Carrier Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dotNumber">DOT Number</Label>
                  <Input
                    id="dotNumber"
                    value={formData.dotNumber}
                    onChange={(e) => setFormData({ ...formData, dotNumber: e.target.value })}
                    placeholder="1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mcNumber">MC Number</Label>
                  <Input
                    id="mcNumber"
                    value={formData.mcNumber}
                    onChange={(e) => setFormData({ ...formData, mcNumber: e.target.value })}
                    placeholder="123456"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Special Equipment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Special Equipment</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {specialEquipmentOptions.map((equipment) => (
                  <label
                    key={equipment}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.specialEquipment.includes(equipment)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialEquipment.includes(equipment)}
                      onChange={() => handleSpecialEquipmentToggle(equipment)}
                      className="rounded"
                    />
                    <span className="text-sm">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Additional Notes</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Any additional information about the truck or special requirements..."
                rows={4}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {isSubmitting ? "Posting..." : "Post Truck"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}