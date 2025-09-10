"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarInitials } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { Truck, Mail, Phone, MapPin, Calendar, Star, Edit2, Save, X, Upload, FileText } from "lucide-react"
import { UserRatings } from "@/components/shared/user-ratings"

export function CarrierProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Mike Johnson" : "Mike Johnson",
    email: user?.email || "mike.johnson@example.com",
    phone: user?.phone || "(555) 987-6543",
    company: user?.companyName || "Johnson Trucking",
    address: "456 Truck Lane, Detroit, MI 48201",
    bio: "Professional box truck operator with 8 years of experience. Specializing in electronics and medical supply deliveries across the Midwest.",
    mcNumber: "MC-789012",
    dotNumber: "DOT-345678",
    vehicleType: "Box Truck",
    vehicleYear: "2020",
    vehicleMake: "Ford",
    vehicleModel: "E-450",
    maxWeight: "10,000",
    insuranceCarrier: "Progressive Commercial",
    insuranceExpiry: "2024-12-31",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log("Saving profile data:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Mike Johnson" : "Mike Johnson",
      email: user?.email || "mike.johnson@example.com",
      phone: user?.phone || "(555) 987-6543",
      company: user?.companyName || "Johnson Trucking",
      address: "456 Truck Lane, Detroit, MI 48201",
      bio: "Professional box truck operator with 8 years of experience. Specializing in electronics and medical supply deliveries across the Midwest.",
      mcNumber: "MC-789012",
      dotNumber: "DOT-345678",
      vehicleType: "Box Truck",
      vehicleYear: "2020",
      vehicleMake: "Ford",
      vehicleModel: "E-450",
      maxWeight: "10,000",
      insuranceCarrier: "Progressive Commercial",
      insuranceExpiry: "2024-12-31",
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carrier Profile</h1>
          <p className="text-gray-600">Manage your professional information and vehicle details</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarInitials name={formData.name} className="text-2xl" />
              </Avatar>
            </div>
            <CardTitle>{formData.name}</CardTitle>
            <CardDescription>{formData.company}</CardDescription>
            <div className="flex justify-center mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Verified Carrier
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{formData.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{formData.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{formData.address}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Member since Jan 2022</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.8/5.0 Rating (23 reviews)</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal and business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                ) : (
                  <p className="text-sm py-2">{formData.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{formData.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{formData.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                {isEditing ? (
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{formData.company}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mcNumber">MC Number</Label>
                {isEditing ? (
                  <Input
                    id="mcNumber"
                    value={formData.mcNumber}
                    onChange={(e) => handleInputChange("mcNumber", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{formData.mcNumber}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dotNumber">DOT Number</Label>
                {isEditing ? (
                  <Input
                    id="dotNumber"
                    value={formData.dotNumber}
                    onChange={(e) => handleInputChange("dotNumber", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{formData.dotNumber}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Business Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{formData.address}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about your experience and specializations..."
                  />
                ) : (
                  <p className="text-sm py-2">{formData.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
          <CardDescription>Details about your vehicle and equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              {isEditing ? (
                <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Box Truck">Box Truck</SelectItem>
                    <SelectItem value="Cargo Van">Cargo Van</SelectItem>
                    <SelectItem value="Straight Truck">Straight Truck</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2">{formData.vehicleType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleYear">Year</Label>
              {isEditing ? (
                <Input
                  id="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={(e) => handleInputChange("vehicleYear", e.target.value)}
                />
              ) : (
                <p className="text-sm py-2">{formData.vehicleYear}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleMake">Make</Label>
              {isEditing ? (
                <Input
                  id="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={(e) => handleInputChange("vehicleMake", e.target.value)}
                />
              ) : (
                <p className="text-sm py-2">{formData.vehicleMake}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Model</Label>
              {isEditing ? (
                <Input
                  id="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                />
              ) : (
                <p className="text-sm py-2">{formData.vehicleModel}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWeight">Max Weight (lbs)</Label>
              {isEditing ? (
                <Input
                  id="maxWeight"
                  value={formData.maxWeight}
                  onChange={(e) => handleInputChange("maxWeight", e.target.value)}
                />
              ) : (
                <p className="text-sm py-2">{formData.maxWeight}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance & Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Insurance & Documents
          </CardTitle>
          <CardDescription>Manage your insurance and required documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceCarrier">Insurance Carrier</Label>
                {isEditing ? (
                  <Input
                    id="insuranceCarrier"
                    value={formData.insuranceCarrier}
                    onChange={(e) => handleInputChange("insuranceCarrier", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{formData.insuranceCarrier}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                {isEditing ? (
                  <Input
                    id="insuranceExpiry"
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{formData.insuranceExpiry}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Document Uploads</Label>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Insurance Certificate
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Driver's License
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Vehicle Registration
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Ratings */}
      <UserRatings
        userId="carrier-1"
        userName={formData.name}
        userRole="carrier"
        currentUserId="carrier-1"
        currentUserName={formData.name}
        currentUserRole="carrier"
        showRateButton={false}
      />
    </div>
  )
}
