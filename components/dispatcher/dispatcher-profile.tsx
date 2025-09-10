"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, MapPin, Phone, Mail, Globe, Users, Truck, Star, Edit, Save, X } from "lucide-react"
import { UserRatings } from "@/components/shared/user-ratings"

interface DispatcherProfile {
  id: string
  name: string
  email: string
  phone: string
  company: string
  title: string
  location: string
  website?: string
  bio: string
  experience: string
  specializations: string[]
  managedCarriers: number
  totalLoads: number
  rating: number
  joinedDate: string
  verified: boolean
  notifications: {
    email: boolean
    sms: boolean
    loadAlerts: boolean
    carrierUpdates: boolean
  }
}

const mockProfile: DispatcherProfile = {
  id: "1",
  name: "Jennifer Martinez",
  email: "jennifer@dispatchpro.com",
  phone: "(555) 123-4567",
  company: "DispatchPro Solutions",
  title: "Senior Dispatcher",
  location: "Dallas, TX",
  website: "www.dispatchpro.com",
  bio: "Experienced dispatcher with over 8 years in freight logistics. Specializing in box truck and cargo van operations across the Southeast region.",
  experience: "8+ years",
  specializations: ["Box Truck Operations", "Cargo Van Logistics", "Regional Distribution", "Last Mile Delivery"],
  managedCarriers: 25,
  totalLoads: 1247,
  rating: 4.9,
  joinedDate: "2020-03-15",
  verified: true,
  notifications: {
    email: true,
    sms: true,
    loadAlerts: true,
    carrierUpdates: true,
  },
}

export function DispatcherProfile() {
  const [profile, setProfile] = useState<DispatcherProfile>(mockProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<DispatcherProfile>(mockProfile)

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const updateNotificationSetting = (key: keyof typeof profile.notifications, value: boolean) => {
    setProfile({
      ...profile,
      notifications: {
        ...profile.notifications,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your dispatcher profile and settings</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="company">Company Details</TabsTrigger>
          <TabsTrigger value="stats">Performance Stats</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={`/placeholder_svg.png?height=96&width=96&text=${profile.name.charAt(0)}`} />
                    <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <CardDescription>{profile.title}</CardDescription>
                <div className="flex justify-center items-center space-x-2 mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm font-medium">{profile.rating}</span>
                  </div>
                  {profile.verified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>{profile.company}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{profile.email}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span>{profile.website}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and bio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={isEditing ? editedProfile.name : profile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={isEditing ? editedProfile.title : profile.title}
                      onChange={(e) => setEditedProfile({ ...editedProfile, title: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editedProfile.email : profile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={isEditing ? editedProfile.phone : profile.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={isEditing ? editedProfile.location : profile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your experience and expertise..."
                    value={isEditing ? editedProfile.bio : profile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Manage your company details and verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={isEditing ? editedProfile.company : profile.company}
                    onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={isEditing ? editedProfile.website || "" : profile.website || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                    disabled={!isEditing}
                    placeholder="www.yourcompany.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Select value={profile.experience} disabled={!isEditing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5-8 years">5-8 years</SelectItem>
                    <SelectItem value="8+ years">8+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Company Verified</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your company has been verified and approved for the platform.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Managed Carriers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.managedCarriers}</div>
                <p className="text-xs text-muted-foreground">Active carriers in your fleet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Loads</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.totalLoads.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Loads dispatched successfully</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.rating}</div>
                <p className="text-xs text-muted-foreground">Average carrier rating</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your dispatching performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">On-Time Delivery Rate</span>
                  <span className="text-sm text-green-600 font-medium">96.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "96.5%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Carrier Satisfaction</span>
                  <span className="text-sm text-green-600 font-medium">94.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "94.2%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Load Completion Rate</span>
                  <span className="text-sm text-green-600 font-medium">98.1%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "98.1%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  checked={profile.notifications.email}
                  onCheckedChange={(checked) => updateNotificationSetting("email", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
                </div>
                <Switch
                  checked={profile.notifications.sms}
                  onCheckedChange={(checked) => updateNotificationSetting("sms", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Load Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified about new load opportunities</p>
                </div>
                <Switch
                  checked={profile.notifications.loadAlerts}
                  onCheckedChange={(checked) => updateNotificationSetting("loadAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Carrier Updates</Label>
                  <p className="text-sm text-gray-600">Receive updates from your managed carriers</p>
                </div>
                <Switch
                  checked={profile.notifications.carrierUpdates}
                  onCheckedChange={(checked) => updateNotificationSetting("carrierUpdates", checked)}
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Notification Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiet-hours-start">Quiet Hours Start</Label>
                    <Input id="quiet-hours-start" type="time" defaultValue="22:00" />
                  </div>
                  <div>
                    <Label htmlFor="quiet-hours-end">Quiet Hours End</Label>
                    <Input id="quiet-hours-end" type="time" defaultValue="07:00" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  No notifications will be sent during quiet hours except for emergencies
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Ratings */}
      <UserRatings
        userId="dispatcher-1"
        userName={profile.name}
        userRole="dispatcher"
        currentUserId="dispatcher-1"
        currentUserName={profile.name}
        currentUserRole="dispatcher"
        showRateButton={false}
      />
    </div>
  )
}
