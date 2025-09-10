"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MapPin,
  Calendar,
  Package,
  DollarSign,
  Truck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building,
} from "lucide-react"

interface PostLoadFormProps {
  onSuccess: () => void
}

export function PostLoadForm({ onSuccess }: PostLoadFormProps) {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    pickupDate: "",
    deliveryDate: "",
    weight: "",
    rate: "",
    equipment: "",
    loadType: "",
    description: "",
    specialRequirements: "",
    hazmat: false,
    teamDriver: false,
    expedited: false,
    stops: [] as Array<{ location: string; type: "pickup" | "delivery"; date: string; notes?: string }>,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")

  // Updated equipment types to match the new requirements
  const equipmentTypes = [
    "16ft Box Truck",
    "24ft Box Truck",
    "26ft Box Truck",
    "Box Truck Team",
    "Cargo Van",
    "Sprinter Van",
  ]

  // Load type options
  const loadTypes = [
    { value: "FTL", label: "FTL (Full Truck Load)" },
    { value: "LTL", label: "LTL (Less Than Truck Load)" },
  ]

  // Simple distance calculation based on common routes (in a real app, use Google Maps API)
  const calculateDistance = (origin: string, destination: string): number => {
    const routes: { [key: string]: number } = {
      "chicago,il-atlanta,ga": 716,
      "atlanta,ga-chicago,il": 716,
      "los angeles,ca-phoenix,az": 357,
      "phoenix,az-los angeles,ca": 357,
      "miami,fl-orlando,fl": 235,
      "orlando,fl-miami,fl": 235,
      "new york,ny-boston,ma": 215,
      "boston,ma-new york,ny": 215,
      "dallas,tx-houston,tx": 239,
      "houston,tx-dallas,tx": 239,
      "seattle,wa-portland,or": 173,
      "portland,or-seattle,wa": 173,
      "denver,co-salt lake city,ut": 525,
      "salt lake city,ut-denver,co": 525,
      "detroit,mi-cleveland,oh": 170,
      "cleveland,oh-detroit,mi": 170,
    }

    const key = `${origin.toLowerCase().replace(/\s+/g, "")}-${destination.toLowerCase().replace(/\s+/g, "")}`
    return routes[key] || Math.floor(Math.random() * 500) + 200 // Default random distance if route not found
  }

  const addStop = () => {
    setFormData((prev) => ({
      ...prev,
      stops: [...prev.stops, { location: "", type: "pickup", date: "", notes: "" }],
    }))
  }

  const removeStop = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }))
  }

  const updateStop = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      stops: prev.stops.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)),
    }))
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.origin ||
      !formData.destination ||
      !formData.pickupDate ||
      !formData.deliveryDate ||
      !formData.weight ||
      !formData.rate ||
      !formData.equipment ||
      !formData.loadType
    ) {
      setSubmitStatus("error")
      setSubmitMessage("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      console.log("Submitting load form with data:", formData)

      // Calculate distance
      const distance = calculateDistance(formData.origin, formData.destination)

      const loadData = {
        brokerId: "broker-1", // In a real app, get from auth context
        brokerName: "John Smith",
        brokerCompany: "Smith Logistics",
        brokerMcNumber: "MC-123456", // In a real app, get from user profile
        origin: formData.origin,
        destination: formData.destination,
        pickupDate: formData.pickupDate,
        deliveryDate: formData.deliveryDate,
        weight: Number.parseInt(formData.weight),
        rate: Number.parseInt(formData.rate),
        distance: distance,
        equipment: formData.equipment,
        loadType: formData.loadType as "FTL" | "LTL",
        description: formData.description,
        status: "available" as const,
        expedited: formData.expedited,
        hazmat: formData.hazmat,
        teamDriver: formData.teamDriver,
        specialRequirements: formData.specialRequirements,
        stops: formData.stops,
      }

      console.log("Sending load data to API:", loadData)

      const response = await fetch("/api/loads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loadData),
      })

      console.log("API response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("Load posted successfully:", result)

        setSubmitStatus("success")
        setSubmitMessage(`Load ${result.id} posted successfully and is now available to carriers!`)

        // Reset form
        setFormData({
          origin: "",
          destination: "",
          pickupDate: "",
          deliveryDate: "",
          weight: "",
          rate: "",
          equipment: "",
          loadType: "",
          description: "",
          specialRequirements: "",
          hazmat: false,
          teamDriver: false,
          expedited: false,
          stops: [],
        })

        // Dispatch event to notify other components
        console.log("Dispatching loadPosted event")
        window.dispatchEvent(new CustomEvent("loadPosted", { detail: result }))

        // Call success callback after a short delay
        setTimeout(() => {
          if (onSuccess) {
            console.log("Calling onSuccess callback")
            onSuccess()
          }
        }, 2000)
      } else {
        const errorData = await response.json()
        console.error("Failed to post load:", errorData)
        setSubmitStatus("error")
        setSubmitMessage(errorData.error || "Failed to post load. Please try again.")
      }
    } catch (error) {
      console.error("Error posting load:", error)
      setSubmitStatus("error")
      setSubmitMessage("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Post New Load</h2>
        <p className="text-gray-600">Create a new load posting to connect with carriers</p>
      </div>

      {submitStatus === "success" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">{submitMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {submitStatus === "error" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{submitMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Route Information
            </CardTitle>
            <CardDescription>Specify the pickup and delivery locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin *</Label>
                <Input
                  id="origin"
                  placeholder="e.g., Chicago, IL"
                  value={formData.origin}
                  onChange={(e) => handleInputChange("origin", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Atlanta, GA"
                  value={formData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multiple Stops */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Multiple Stops
            </CardTitle>
            <CardDescription>Add additional pickup or delivery stops (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.stops.map((stop, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Stop {index + 1}</h4>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeStop(index)}>
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Dallas, TX"
                      value={stop.location}
                      onChange={(e) => updateStop(index, "location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stop Type</Label>
                    <Select value={stop.type} onValueChange={(value) => updateStop(index, "type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pickup">Pickup</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={stop.date} onChange={(e) => updateStop(index, "date", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input
                    placeholder="Special instructions for this stop"
                    value={stop.notes || ""}
                    onChange={(e) => updateStop(index, "notes", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addStop} className="w-full bg-transparent">
              <MapPin className="h-4 w-4 mr-2" />
              Add Stop
            </Button>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
            <CardDescription>Set pickup and delivery dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date *</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => handleInputChange("pickupDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Load Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Load Details
            </CardTitle>
            <CardDescription>Specify weight, equipment, and cargo information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs) *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g., 15000"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment Type *</Label>
                <Select value={formData.equipment} onValueChange={(value) => handleInputChange("equipment", value)}>
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
                <Label htmlFor="loadType">Load Type *</Label>
                <Select value={formData.loadType} onValueChange={(value) => handleInputChange("loadType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select load type" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Load Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the cargo, special handling requirements, etc."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                placeholder="Any additional requirements or notes"
                value={formData.specialRequirements}
                onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rate Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Rate Information
            </CardTitle>
            <CardDescription>Set the payment rate for this load</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Total Rate ($) *</Label>
              <Input
                id="rate"
                type="number"
                placeholder="e.g., 1800"
                value={formData.rate}
                onChange={(e) => handleInputChange("rate", e.target.value)}
                required
              />
              {formData.rate && formData.origin && formData.destination && (
                <p className="text-sm text-gray-600">
                  Estimated rate per mile: $
                  {(Number.parseInt(formData.rate) / calculateDistance(formData.origin, formData.destination)).toFixed(
                    2,
                  )}
                  /mile
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Additional Options
            </CardTitle>
            <CardDescription>Special requirements and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hazmat"
                  checked={formData.hazmat}
                  onCheckedChange={(checked) => handleInputChange("hazmat", checked as boolean)}
                />
                <Label htmlFor="hazmat">Hazmat Materials</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="teamDriver"
                  checked={formData.teamDriver}
                  onCheckedChange={(checked) => handleInputChange("teamDriver", checked as boolean)}
                />
                <Label htmlFor="teamDriver">Team Driver Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expedited"
                  checked={formData.expedited}
                  onCheckedChange={(checked) => handleInputChange("expedited", checked as boolean)}
                />
                <Label htmlFor="expedited">Expedited Delivery</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Broker Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Broker Information
            </CardTitle>
            <CardDescription>Your broker details (automatically included)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Broker Company</Label>
                <Input value="Smith Logistics" disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>MC Number</Label>
                <Input value="MC-123456" disabled className="bg-gray-50" />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              This information will be automatically displayed to carriers viewing your load.
            </p>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Save as Draft
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting Load...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Post Load
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
