"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarInitials } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Package,
  DollarSign,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  Plus,
  X,
  Gift,
  Clock,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supportStore, type SupportTicket } from "@/lib/support-store"

interface AdminStats {
  totalUsers: number
  totalLoads: number
  totalRevenue: number
  activeLoads: number
  brokers: number
  carriers: number
  dispatchers: number
  trialUsers: number
  trialRevenuePotential: number
}

interface User {
  id: string
  name: string
  email: string
  role: "broker" | "carrier" | "dispatcher"
  status: "active" | "inactive" | "suspended" | "trial"
  joinDate: string
  lastActive: string
  subscriptionTier: "free" | "trial" | "pro" | "enterprise"
  trialEndsAt?: string
  trialDaysRemaining?: number
}

interface Load {
  id: string
  broker: string
  origin: string
  destination: string
  status: "posted" | "claimed" | "in-transit" | "delivered" | "cancelled"
  rate: number
  postedDate: string
  equipmentType: string
}

interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  userType: "carrier" | "broker" | "dispatcher"
  features: string[]
  limitations: string[]
  subscribers: number
  revenue: number
  status: "active" | "inactive"
  isPopular?: boolean
  cta: string
  trialDays: number
  trialFeatures: string[]
  trialUsers?: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLoads: 0,
    totalRevenue: 0,
    activeLoads: 0,
    brokers: 0,
    carriers: 0,
    dispatchers: 0,
    trialUsers: 0,
    trialRevenuePotential: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [loads, setLoads] = useState<Load[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [loadSearch, setLoadSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("users")

  // Pricing management states
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [viewingAnalytics, setViewingAnalytics] = useState<PricingPlan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<PricingPlan | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // User management states
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)

  // Settings states
  const [platformSettings, setPlatformSettings] = useState({
    siteName: "BOXALOO",
    siteDescription: "Box Truck & Cargo Van Load Board",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    maxLoadPostings: 1000,
    sessionTimeout: 30,
    apiRateLimit: 100,
    trialExtensionEnabled: true,
    maxTrialExtensionDays: 7,
  })

  // Updated pricing plans data - single plan per user type with trial info
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([
    // Single Carrier Plan
    {
      id: "carrier-plan",
      name: "Carrier Plan",
      description: "Complete solution for carriers and fleets",
      monthlyPrice: 99,
      userType: "carrier",
      features: [
        "Unlimited load searches",
        "Advanced search filters",
        "Priority load notifications",
        "Route optimization tools",
        "Load history & analytics",
        "Priority customer support",
        "Payment protection",
        "Credit line access",
        "Fuel card integration",
        "Fleet management dashboard",
        "Mobile app access",
        "24/7 phone support",
      ],
      limitations: [],
      subscribers: 4294,
      revenue: 425106,
      status: "active",
      isPopular: true,
      cta: "Start Free Trial",
      trialDays: 14,
      trialFeatures: [
        "Up to 50 load searches",
        "Basic search filters",
        "Email notifications",
        "Mobile app access",
        "Standard customer support",
      ],
      trialUsers: 1247,
    },
    // Single Broker Plan
    {
      id: "broker-plan",
      name: "Broker Plan",
      description: "Complete solution for brokers and 3PLs",
      monthlyPrice: 149,
      userType: "broker",
      features: [
        "Unlimited load postings",
        "Advanced carrier matching",
        "Priority load placement",
        "Extended posting duration (30 days)",
        "Carrier verification tools",
        "Advanced analytics & reporting",
        "Priority customer support",
        "Credit checks on carriers",
        "Automated load reposting",
        "Custom load templates",
        "Multi-user accounts",
        "Custom integrations & API",
        "White-label solutions",
        "24/7 phone support",
      ],
      limitations: [],
      subscribers: 1866,
      revenue: 493834,
      status: "active",
      isPopular: true,
      cta: "Start Free Trial",
      trialDays: 7,
      trialFeatures: [
        "Up to 10 load postings",
        "Basic carrier search",
        "Email notifications",
        "Standard posting duration (7 days)",
        "Basic analytics",
        "Email support",
      ],
      trialUsers: 892,
    },
    // Single Dispatcher Plan
    {
      id: "dispatcher-plan",
      name: "Dispatcher Plan",
      description: "Complete solution for dispatchers and fleet managers",
      monthlyPrice: 79,
      userType: "dispatcher",
      features: [
        "Unlimited driver management",
        "Multi-client management",
        "Advanced route optimization",
        "Driver performance analytics",
        "Automated dispatch notifications",
        "Load assignment tools",
        "Priority customer support",
        "Client reporting dashboard",
        "Fuel optimization tools",
        "Multi-location support",
        "Advanced analytics suite",
        "Custom integrations",
        "API access",
        "24/7 phone support",
      ],
      limitations: [],
      subscribers: 879,
      revenue: 69441,
      status: "active",
      isPopular: true,
      cta: "Start Free Trial",
      trialDays: 10,
      trialFeatures: [
        "Manage up to 5 drivers",
        "Load search & booking",
        "Driver communication tools",
        "Basic route planning",
        "Load tracking",
        "Email notifications",
      ],
      trialUsers: 456,
    },
  ])

  // Support management states
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])

  useEffect(() => {
    // Load all tickets from the store
    const loadTickets = () => {
      const allTickets = supportStore.getAllTickets()
      setSupportTickets(allTickets)
    }

    loadTickets()

    // Listen for new tickets and updates
    const handleTicketCreated = () => loadTickets()
    const handleTicketUpdated = () => loadTickets()
    const handleResponseAdded = () => loadTickets()
    const handleTicketAssigned = () => loadTickets()

    window.addEventListener("supportTicketCreated", handleTicketCreated)
    window.addEventListener("supportTicketUpdated", handleTicketUpdated)
    window.addEventListener("supportResponseAdded", handleResponseAdded)
    window.addEventListener("supportTicketAssigned", handleTicketAssigned)

    return () => {
      window.removeEventListener("supportTicketCreated", handleTicketCreated)
      window.removeEventListener("supportTicketUpdated", handleTicketUpdated)
      window.removeEventListener("supportResponseAdded", handleResponseAdded)
      window.removeEventListener("supportTicketAssigned", handleTicketAssigned)
    }
  }, [])

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)
  const [newResponse, setNewResponse] = useState("")
  const [ticketSearch, setTicketSearch] = useState("")
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all")

  // Listen for tab change events from navigation
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail.tab)
    }

    window.addEventListener("adminTabChange", handleTabChange as EventListener)

    // Check URL hash on component mount
    const hash = window.location.hash.replace("#", "")
    if (hash && ["users", "loads", "pricing", "support", "settings", "analytics"].includes(hash)) {
      setActiveTab(hash)
    }

    return () => {
      window.removeEventListener("adminTabChange", handleTabChange as EventListener)
    }
  }, [])

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      // const statsResponse = await fetch("/api/admin/stats")
      // if (statsResponse.ok) {
      //   const statsData = await statsResponse.json()
      //   setStats(statsData)
      // }

      // Fetch users
      // const usersResponse = await fetch("/api/admin/users")
      // if (usersResponse.ok) {
      //   const usersData = await usersResponse.json()
      //   setUsers(usersData)
      // }

      // Fetch loads
      // const loadsResponse = await fetch("/api/admin/loads")
      // if (loadsResponse.ok) {
      //   const loadsData = await loadsResponse.json()
      //   setLoads(loadsData)
      // }
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan({ ...plan })
    setIsEditDialogOpen(true)
  }

  const handleSavePlan = async () => {
    if (!editingPlan) return

    try {
      const response = await fetch("/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: editingPlan.id,
          updates: editingPlan,
        }),
      })

      if (response.ok) {
        // Update local state
        setPricingPlans((prevPlans) => prevPlans.map((plan) => (plan.id === editingPlan.id ? editingPlan : plan)))

        // Notify frontend about the update
        localStorage.setItem("pricing-updated", Date.now().toString())
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pricing-updated",
            newValue: Date.now().toString(),
          }),
        )

        // Also dispatch a custom event for same-tab updates
        window.dispatchEvent(new CustomEvent("pricing-updated"))

        setEditingPlan(null)
        setIsEditDialogOpen(false)

        alert("Plan updated successfully! Changes will appear on the frontend immediately.")
      } else {
        throw new Error("Failed to update plan")
      }
    } catch (error) {
      console.error("Error updating plan:", error)
      alert("Failed to update plan. Please try again.")
    }
  }

  const handleViewAnalytics = (plan: PricingPlan) => {
    setViewingAnalytics(plan)
    setIsAnalyticsDialogOpen(true)
  }

  const handleDeletePlan = (plan: PricingPlan) => {
    setDeletingPlan(plan)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    await handleSavePlan()
  }

  const handleConfirmDelete = () => {
    if (deletingPlan) {
      // Remove the plan from state
      setPricingPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== deletingPlan.id))

      // Here you would typically make an API call to delete the plan
      console.log("Deleting plan:", deletingPlan.id)
      setIsDeleteDialogOpen(false)
      setDeletingPlan(null)

      // Show success message
      alert("Plan deleted successfully!")
    }
  }

  const addFeature = () => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: [...editingPlan.features, ""],
      })
    }
  }

  const removeFeature = (index: number) => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: editingPlan.features.filter((_, i) => i !== index),
      })
    }
  }

  const updateFeature = (index: number, value: string) => {
    if (editingPlan) {
      const newFeatures = [...editingPlan.features]
      newFeatures[index] = value
      setEditingPlan({
        ...editingPlan,
        features: newFeatures,
      })
    }
  }

  const addTrialFeature = () => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        trialFeatures: [...editingPlan.trialFeatures, ""],
      })
    }
  }

  const removeTrialFeature = (index: number) => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        trialFeatures: editingPlan.trialFeatures.filter((_, i) => i !== index),
      })
    }
  }

  const updateTrialFeature = (index: number, value: string) => {
    if (editingPlan) {
      const newTrialFeatures = [...editingPlan.trialFeatures]
      newTrialFeatures[index] = value
      setEditingPlan({
        ...editingPlan,
        trialFeatures: newTrialFeatures,
      })
    }
  }

  const addLimitation = () => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        limitations: [...editingPlan.limitations, ""],
      })
    }
  }

  const removeLimitation = (index: number) => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        limitations: editingPlan.limitations.filter((_, i) => i !== index),
      })
    }
  }

  const updateLimitation = (index: number, value: string) => {
    if (editingPlan) {
      const newLimitations = [...editingPlan.limitations]
      newLimitations[index] = value
      setEditingPlan({
        ...editingPlan,
        limitations: newLimitations,
      })
    }
  }

  // User management functions
  const handleViewUser = (user: User) => {
    setViewingUser(user)
    setIsViewUserDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
    setIsEditUserDialogOpen(true)
  }

  const handleSuspendUser = async (user: User) => {
    try {
      const newStatus = user.status === "active" ? "suspended" : "active"

      // Update user in state
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)))

      // Here you would make an API call to update the user status
      console.log(`${newStatus === "suspended" ? "Suspending" : "Activating"} user:`, user.id)
      alert(`User ${newStatus === "suspended" ? "suspended" : "activated"} successfully!`)
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Failed to update user status")
    }
  }

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user)
    setIsDeleteUserDialogOpen(true)
  }

  const handleConfirmDeleteUser = async () => {
    if (deletingUser) {
      try {
        // Remove user from state
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deletingUser.id))

        // Here you would make an API call to delete the user
        console.log("Deleting user:", deletingUser.id)
        setIsDeleteUserDialogOpen(false)
        setDeletingUser(null)
        alert("User deleted successfully!")
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("Failed to delete user")
      }
    }
  }

  const handleSaveUserEdit = async () => {
    if (editingUser) {
      try {
        // Update user in state
        setUsers((prevUsers) => prevUsers.map((user) => (user.id === editingUser.id ? editingUser : user)))

        // Here you would make an API call to save the changes
        console.log("Saving user:", editingUser)
        setIsEditUserDialogOpen(false)
        setEditingUser(null)
        alert("User updated successfully!")
      } catch (error) {
        console.error("Error updating user:", error)
        alert("Failed to update user")
      }
    }
  }

  // Settings management functions
  const handleSaveSettings = async () => {
    try {
      // Here you would make an API call to save the settings
      console.log("Saving settings:", platformSettings)
      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings")
    }
  }

  // Support management functions
  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setIsTicketDialogOpen(true)
  }

  const handleSendResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return

    supportStore.addResponse(selectedTicket.id, {
      ticketId: selectedTicket.id,
      senderId: "admin-current",
      senderName: "Support Team",
      senderType: "admin",
      message: newResponse.trim(),
    })

    setNewResponse("")
    alert("Response sent successfully!")
  }

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: SupportTicket["status"]) => {
    supportStore.updateTicketStatus(ticketId, newStatus)
    alert("Ticket status updated successfully!")
  }

  const handleAssignTicket = async (ticketId: string, assignee: string) => {
    supportStore.assignTicket(ticketId, assignee)
    alert("Ticket assigned successfully!")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "trial":
        return "bg-blue-100 text-blue-800"
      case "posted":
        return "bg-blue-100 text-blue-800"
      case "claimed":
        return "bg-yellow-100 text-yellow-800"
      case "in-transit":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "open":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-blue-100 text-blue-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "broker":
        return "bg-blue-100 text-blue-800"
      case "carrier":
        return "bg-green-100 text-green-800"
      case "dispatcher":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-gray-100 text-gray-800"
      case "trial":
        return "bg-blue-100 text-blue-800"
      case "pro":
        return "bg-green-100 text-green-800"
      case "enterprise":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()),
  )

  const filteredLoads = loads.filter(
    (load) =>
      load.broker.toLowerCase().includes(loadSearch.toLowerCase()) ||
      load.origin.toLowerCase().includes(loadSearch.toLowerCase()) ||
      load.destination.toLowerCase().includes(loadSearch.toLowerCase()),
  )

  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(ticketSearch.toLowerCase())
    const matchesFilter = ticketFilter === "all" || ticket.status === ticketFilter
    return matchesSearch && matchesFilter
  })

  const getPlansByUserType = (userType: "carrier" | "broker" | "dispatcher") => {
    return pricingPlans.filter((plan) => plan.userType === userType)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Badge className="bg-red-100 text-red-800">Admin Access</Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trialUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active free trials</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="loads">Loads</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all platform users</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarInitials name={user.name} />
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          <Badge className={getSubscriptionColor(user.subscriptionTier)}>{user.subscriptionTier}</Badge>
                          {user.status === "trial" && user.trialDaysRemaining && (
                            <Badge variant="outline" className="text-blue-600">
                              <Clock className="h-3 w-3 mr-1" />
                              {user.trialDaysRemaining}d left
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined {user.joinDate} • Last active {user.lastActive}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        {user.status === "active" ? (
                          <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Load Management</CardTitle>
                  <CardDescription>Monitor all loads on the platform</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search loads..."
                      value={loadSearch}
                      onChange={(e) => setLoadSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLoads.map((load) => (
                  <div key={load.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{load.id}</h4>
                          <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                          <Badge variant="outline">{load.equipmentType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {load.origin} → {load.destination}
                        </p>
                        <p className="text-xs text-gray-400">
                          Posted by {load.broker} on {load.postedDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-green-600">${load.rate.toLocaleString()}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Load
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Flag Load
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Load
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Management</CardTitle>
              <CardDescription>Manage subscription plans and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {pricingPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <p className="text-gray-600">{plan.description}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">Per User</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">${plan.monthlyPrice}</div>
                        <div className="text-sm text-gray-500">per month per user</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{plan.trialDays}</div>
                        <div className="text-sm text-blue-500">trial days</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Features:</strong> {plan.features.length} features included
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Manage customer support requests and communications</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={ticketFilter} onValueChange={(value: any) => setTicketFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                          <Badge className={getRoleColor(ticket.userRole)}>{ticket.userRole}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          From: {ticket.userName} ({ticket.userEmail})
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {ticket.createdAt} • Updated: {ticket.updatedAt}
                          {ticket.assignedTo && ` • Assigned to: ${ticket.assignedTo}`}
                        </p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{ticket.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateTicketStatus(ticket.id, "in_progress")}>
                            Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateTicketStatus(ticket.id, "resolved")}>
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateTicketStatus(ticket.id, "closed")}>
                            Close Ticket
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignTicket(ticket.id, "Support Team")}>
                            Assign to Support
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {filteredTickets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No support tickets found matching your criteria.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure global platform settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">General Settings</h3>

                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={platformSettings.siteName}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={platformSettings.siteDescription}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, siteDescription: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceMode"
                      checked={platformSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setPlatformSettings({ ...platformSettings, maintenanceMode: checked })
                      }
                    />
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="registrationEnabled"
                      checked={platformSettings.registrationEnabled}
                      onCheckedChange={(checked) =>
                        setPlatformSettings({ ...platformSettings, registrationEnabled: checked })
                      }
                    />
                    <Label htmlFor="registrationEnabled">Allow New Registrations</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Trial Settings</h3>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="trialExtensionEnabled"
                      checked={platformSettings.trialExtensionEnabled}
                      onCheckedChange={(checked) =>
                        setPlatformSettings({ ...platformSettings, trialExtensionEnabled: checked })
                      }
                    />
                    <Label htmlFor="trialExtensionEnabled">Allow Trial Extensions</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTrialExtensionDays">Max Trial Extension (days)</Label>
                    <Input
                      id="maxTrialExtensionDays"
                      type="number"
                      value={platformSettings.maxTrialExtensionDays}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          maxTrialExtensionDays: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={platformSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setPlatformSettings({ ...platformSettings, emailNotifications: checked })
                      }
                    />
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smsNotifications"
                      checked={platformSettings.smsNotifications}
                      onCheckedChange={(checked) =>
                        setPlatformSettings({ ...platformSettings, smsNotifications: checked })
                      }
                    />
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={platformSettings.sessionTimeout}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          sessionTimeout: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trial Conversion Rate</CardTitle>
                <CardDescription>Trial to paid subscription conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Trial conversion analytics chart would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">Analytics chart would go here</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Platform revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">Analytics chart would go here</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trial Activity</CardTitle>
                <CardDescription>Trial user engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">Analytics chart would go here</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan: {editingPlan?.name}</DialogTitle>
            <DialogDescription>Modify the plan details, pricing, trial settings, and features.</DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planDescription">Description</Label>
                  <Input
                    id="planDescription"
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice">Monthly Price ($) - Per User</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    value={editingPlan.monthlyPrice}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        monthlyPrice: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trialDays">Trial Days</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    value={editingPlan.trialDays}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        trialDays: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trial Features</Label>
                <div className="space-y-2">
                  {editingPlan.trialFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateTrialFeature(index, e.target.value)}
                        placeholder="Enter trial feature description"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTrialFeature(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addTrialFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trial Feature
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Full Plan Features</Label>
                <div className="space-y-2">
                  {editingPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature description"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Limitations</Label>
                <div className="space-y-2">
                  {editingPlan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={limitation}
                        onChange={(e) => updateLimitation(index, e.target.value)}
                        placeholder="Enter limitation description"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => removeLimitation(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addLimitation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Limitation
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planStatus">Status</Label>
                  <select
                    id="planStatus"
                    className="w-full p-2 border rounded-md"
                    value={editingPlan.status}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, status: e.target.value as "active" | "inactive" })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planCta">Call to Action</Label>
                  <Input
                    id="planCta"
                    value={editingPlan.cta}
                    onChange={(e) => setEditingPlan({ ...editingPlan, cta: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planPopular">Popular Plan</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="planPopular"
                      checked={editingPlan.isPopular || false}
                      onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                    />
                    <Label htmlFor="planPopular">Mark as popular</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Analytics: {viewingAnalytics?.name}</DialogTitle>
            <DialogDescription>Detailed analytics and performance metrics for this plan.</DialogDescription>
          </DialogHeader>
          {viewingAnalytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Paid Subscribers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{viewingAnalytics.subscribers.toLocaleString()}</div>
                    <p className="text-xs text-green-600">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{viewingAnalytics.trialUsers?.toLocaleString()}</div>
                    <p className="text-xs text-blue-600">Active trials</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${viewingAnalytics.revenue.toLocaleString()}</div>
                    <p className="text-xs text-green-600">+8% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23.5%</div>
                    <p className="text-xs text-green-600">Trial to paid</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trial Conversion</CardTitle>
                    <CardDescription>Trial to paid conversion trend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Trial conversion chart would go here
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue from this plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Revenue trend chart would go here
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">94%</div>
                      <div className="text-sm text-gray-500">Customer Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">87%</div>
                      <div className="text-sm text-gray-500">Feature Utilization</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">156</div>
                      <div className="text-sm text-gray-500">Avg. Loads/Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">23</div>
                      <div className="text-sm text-gray-500">Avg. Session Time (min)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsAnalyticsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{deletingPlan?.name}" plan? This action cannot be undone. All
              subscribers will need to be migrated to a different plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View User Dialog */}
      <Dialog open={isViewUserDialogOpen} onOpenChange={setIsViewUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              User Details: {viewingUser?.name}
            </DialogTitle>
            <DialogDescription>Complete information about this user account.</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarInitials name={viewingUser.name} />
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{viewingUser.name}</h3>
                  <p className="text-gray-600">{viewingUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRoleColor(viewingUser.role)}>{viewingUser.role}</Badge>
                    <Badge className={getStatusColor(viewingUser.status)}>{viewingUser.status}</Badge>
                    <Badge className={getSubscriptionColor(viewingUser.subscriptionTier)}>
                      {viewingUser.subscriptionTier}
                    </Badge>
                    {viewingUser.status === "trial" && viewingUser.trialDaysRemaining && (
                      <Badge variant="outline" className="text-blue-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {viewingUser.trialDaysRemaining}d left
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">User ID</Label>
                  <p className="text-sm">{viewingUser.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <p className="text-sm capitalize">{viewingUser.role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <p className="text-sm capitalize">{viewingUser.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Subscription</Label>
                  <p className="text-sm capitalize">{viewingUser.subscriptionTier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Join Date</Label>
                  <p className="text-sm">{viewingUser.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Active</Label>
                  <p className="text-sm">{viewingUser.lastActive}</p>
                </div>
                {viewingUser.trialEndsAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Trial Ends</Label>
                    <p className="text-sm">{viewingUser.trialEndsAt}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Account Activity</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {viewingUser.role === "broker" ? "23" : viewingUser.role === "carrier" ? "156" : "89"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {viewingUser.role === "broker"
                        ? "Loads Posted"
                        : viewingUser.role === "carrier"
                          ? "Loads Completed"
                          : "Drivers Managed"}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      $
                      {viewingUser.role === "broker" ? "45,230" : viewingUser.role === "carrier" ? "234,500" : "67,890"}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">4.8</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewUserDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User: {editingUser?.name}
            </DialogTitle>
            <DialogDescription>Modify user account information and settings.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value: "broker" | "carrier" | "dispatcher") =>
                      setEditingUser({ ...editingUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="carrier">Carrier</SelectItem>
                      <SelectItem value="dispatcher">Dispatcher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingUser.status}
                    onValueChange={(value: "active" | "inactive" | "suspended" | "trial") =>
                      setEditingUser({ ...editingUser, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subscription">Subscription</Label>
                  <Select
                    value={editingUser.subscriptionTier}
                    onValueChange={(value: "free" | "trial" | "pro" | "enterprise") =>
                      setEditingUser({ ...editingUser, subscriptionTier: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">User ID</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{editingUser.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Join Date</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{editingUser.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUserEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deletingUser?.name}</strong>'s account? This action
              cannot be undone and will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove all user data and history</li>
                <li>Cancel any active subscriptions</li>
                <li>Delete associated loads and messages</li>
                <li>Revoke all access permissions</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Support Ticket Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Support Ticket: {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              Ticket from {selectedTicket?.userName} ({selectedTicket?.userRole})
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">User Role</Label>
                  <div className="mt-1">
                    <Badge className={getRoleColor(selectedTicket.userRole)}>{selectedTicket.userRole}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                  <p className="text-sm mt-1">{selectedTicket.assignedTo || "Unassigned"}</p>
                </div>
              </div>

              {/* Original Message */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarInitials name={selectedTicket.userName} />
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedTicket.userName}</p>
                        <p className="text-sm text-gray-500">{selectedTicket.userEmail}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{selectedTicket.createdAt}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Responses */}
                {selectedTicket.responses.map((response) => (
                  <div key={response.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarInitials name={response.senderName} />
                        </Avatar>
                        <div>
                          <p className="font-medium">{response.senderName}</p>
                          <p className="text-sm text-gray-500">
                            {response.senderType === "admin" ? "Support Team" : "Customer"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{response.timestamp}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${response.senderType === "admin" ? "bg-green-50" : "bg-blue-50"}`}>
                      <p className="text-sm">{response.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Form */}
              <div className="space-y-4">
                <Label htmlFor="response">Send Response</Label>
                <Textarea
                  id="response"
                  placeholder="Type your response here..."
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value: SupportTicket["status"]) =>
                        handleUpdateTicketStatus(selectedTicket.id, value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSendResponse} disabled={!newResponse.trim()}>
                    Send Response
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
