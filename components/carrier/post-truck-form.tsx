"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Truck, Calendar, MapPin, CheckCircle, FileText } from 'lucide-react'
import { Truck as TruckType } from "@/lib/types"

interface PostTruckFormProps {
  onBack: () => void
  onTruckPosted: () => void
}

export function PostTruckForm({ onBack, onTruckPosted }: PostTruckFormProps) {
  const [formData, setFormData] = useState({
    truckType: "",
    availableDate: "",
    city: "",
    state: "",
    description: "",
    capacity: "",
    specialEquipment: [] as string[],
    dotNumber: "",
    mcNumber: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const truckTypes = [
    "16ft Box Truck",
    "24ft Box Truck",
    "26ft Box Truck",
    "Box Truck Team",
    "Cargo Van",
    "Sprinter Van"
  ]

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ]

  const specialEquipmentOptions = [
    "Liftgate",
    "Pallet Jack",
    "Straps",
    "Chains",
    "Tarps",
    "Temperature Control",
    "GPS Tracking",
    "Load Bars"
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecialEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialEquipment: checked
        ? [...prev.specialEquipment, equipment]
        : prev.specialEquipment.filter(item => item !== equipment)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitSuccess(false)

    try {
      const truckData: Partial<TruckType> = {
        carrierId: "carrier-123", // This would come from auth context
        carrierName: "Mike Johnson", // This would come from auth context
        carrierCompany: "Johnson Transport", // This would come from auth context
        equipmentType: formData.truckType,
        availableDate: formData.availableDate,
        city: formData.city,
        state: formData.state,
        description: formData.description || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        specialEquipment: formData.specialEquipment.length > 0 ? formData.specialEquipment : undefined,
        dotNumber: formData.dotNumber || undefined,
        mcNumber: formData.mcNumber || undefined,
        status: "available"
      }

      console.log('Submitting truck data:', truckData)

      const response = await fetch('/api/trucks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(truckData),
      })

      const responseData = await response.json()
      console.log('Response:', responseData)

      if (response.ok) {
        setSubmitSuccess(true)
        
        // Reset form
        setFormData({
          truckType: "",
          availableDate: "",
          city: "",
          state: "",
          description: "",
          capacity: "",
          specialEquipment: [],
          dotNumber: "",
          mcNumber: ""
        })
        
        // Show success message briefly, then notify parent and go back
        setTimeout(() => {
          onTruckPosted()
          onBack()
        }, 1500)
        
      } else {
        throw new Error(responseData.error || 'Failed to post truck')
      }
    } catch (error) {
      console.error('Error posting truck:', error)
      alert(`Failed to post truck: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-600 mb-2">Truck Posted Successfully!</h3>
              <p className="text-gray-600">Your truck is now available for brokers to see.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Post Available Truck</h1>
          <p className="text-gray-600">Let brokers know about your available truck</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Truck Information
          </CardTitle>
          <CardDescription>
            Provide details about your available truck to help brokers find you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="truckType">Truck Type *</Label>
                <Select value={formData.truckType} onValueChange={(value) => handleInputChange('truckType', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select truck type" />
                  </SelectTrigger>
                  <SelectContent>
                    {truckTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Available Date *
                </Label>
                <Input
                  id="availableDate"
                  type="date"
                  value={formData.availableDate}
                  onChange={(e) => handleInputChange('availableDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City *
                </Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
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
                  placeholder="e.g., 10000"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dotNumber" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  DOT Number
                </Label>
                <Input
                  id="dotNumber"
                  placeholder="e.g., 1234567"
                  value={formData.dotNumber}
                  onChange={(e) => handleInputChange('dotNumber', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mcNumber" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  MC Number
                </Label>
                <Input
                  id="mcNumber"
                  placeholder="e.g., MC-123456"
                  value={formData.mcNumber}
                  onChange={(e) => handleInputChange('mcNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Equipment</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specialEquipmentOptions.map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={formData.specialEquipment.includes(equipment)}
                      onCheckedChange={(checked) => 
                        handleSpecialEquipmentChange(equipment, checked as boolean)
                      }
                    />
                    <Label htmlFor={equipment} className="text-sm">
                      {equipment}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Notes</Label>
              <Textarea
                id="description"
                placeholder="Any additional information about your truck or availability..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Posting...' : 'Post Truck'}
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
