"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarInitials } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { Building2, Mail, Phone, MapPin, Calendar, Star, Edit2, Save, X } from "lucide-react"
import { UserRatings } from "@/components/shared/user-ratings"

export function BrokerProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || "John Smith" : "John Smith",
    email: user?.email || "john.smith@example.com", 
    phone: user?.phone || "(555) 123-4567",
    company: user?.companyName || "Smith Logistics LLC",
    address: "123 Business Ave, Chicago, IL 60601",
    bio: "Experienced freight broker with over 10 years in the logistics industry. Specializing in full truckload shipments across the Midwest and Southeast regions.",
    mcNumber: "MC-123456",
    dotNumber: "DOT-987654",
    website: "www.smithlogistics.com",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving profile data:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || "John Smith" : "John Smith",
      email: user?.email || "john.smith@example.com", 
      phone: user?.phone || "(555) 123-4567",
      company: user?.companyName || "Smith Logistics LLC",
      address: "123 Business Ave, Chicago, IL 60601",
      bio: "Experienced freight broker with over 10 years in the logistics industry. Specializing in full truckload shipments across the Midwest and Southeast regions.",
      mcNumber: "MC-123456",
      dotNumber: "DOT-987654",
      website: "www.smithlogistics.com",
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Broker Profile</h1>
          <p className="text-gray-600">Manage your professional information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
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
                Verified Broker
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
              <span>Member since Jan 2020</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.8/5.0 Rating (127 reviews)</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your professional details and contact information</CardDescription>
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
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2">{formData.website}</p>
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
                    placeholder="Tell us about your business and experience..."
                  />
                ) : (
                  <p className="text-sm py-2">{formData.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Statistics
          </CardTitle>
          <CardDescription>Your performance metrics and business insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
              <p className="text-sm text-gray-600">Total Loads Posted</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
              <p className="text-sm text-gray-600">Partner Carriers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.8</div>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Ratings */}
      <UserRatings
        userId="broker-1"
        userName={formData.name}
        userRole="broker"
        currentUserId="broker-1"
        currentUserName={formData.name}
        currentUserRole="broker"
        showRateButton={false}
      />
    </div>
  )
}
