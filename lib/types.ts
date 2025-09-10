export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "carrier" | "broker" | "dispatcher" | "admin"
  companyName: string
  phone: string
  isActive: boolean
  createdAt: string
  subscription?: {
    planId: string
    status: "active" | "trial" | "expired" | "cancelled"
    trialEndsAt?: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  }
}

export interface Load {
  id: string
  brokerId: string
  brokerName: string
  brokerCompany: string
  brokerMC?: string
  title: string
  description: string
  pickupLocation: string
  deliveryLocation: string
  pickupDate: string
  deliveryDate: string
  postedDate: string
  weight: number
  rate: number
  equipmentType: string
  loadType: "FTL" | "LTL"
  status: "available" | "claimed" | "in-transit" | "delivered" | "cancelled"| "booked"
  createdAt: string
  updatedAt: string
  claimedBy?: string
  claimedAt?: string
  distance?: number
  expedited?: boolean  
  hazmat?: boolean     
  teamDriver?: boolean 
  assignedCarrier?: string
  stops?: Array<{
    id: string
    type: "pickup" | "delivery"
    location: string
    date: string
    time?: string
    notes?: string
  }>
}

export interface Truck {
  id: string
  carrierId: string
  carrierName: string
  carrierCompany: string
  phone?: string
  city: string
  state: string
  equipmentType: string           
  capacity?: number
  availableDate: string
  description?: string
  dotNumber?: string
  mcNumber?: string
  specialEquipment?: string[]
  postedDate: string              // instead of createdAt
  status: "available" | "booked" | "in_transit" | "maintenance"
}


export interface Message {
  id: string
  senderId: string
  senderName: string
  senderCompany: string
  senderMC?: string
  receiverId: string
  receiverName: string
  receiverCompany: string
  receiverMC?: string
  subject: string
  content: string
  timestamp: string
  read: boolean
  loadId?: string
  truckId?: string
}

export interface Notification {
  id: string
  userId: string
  type: "load_match" | "message" | "booking" | "payment" | "system" | "trial_expiring" | "trial_expired"
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  postedDate: string
}

export interface SearchFilters {
  equipmentType?: string
  minRate?: number
  maxRate?: number
  pickupState?: string
  deliveryState?: string
  dateRange?: {
    start: string
    end: string
  }
  maxDistance?: number
  sortBy?: "rate" | "distance" | "date"
  sortOrder?: "asc" | "desc"
}

export interface DashboardStats {
  totalUsers: number
  activeLoads: number
  availableTrucks: number
  totalRevenue: number
  monthlyGrowth: number
  trialUsers: number
  conversionRate: number
}

export interface TrialInfo {
  days: number
  features: string[]
  isActive: boolean
  endsAt?: string
  daysRemaining?: number
}

export interface Carrier {
  id: string
  name: string
  company: string
  location: string
  rating: number
  equipmentType: string
  phone?: string
  email?: string
  mcNumber?: string
  dotNumber?: string
  joinedDate?: string     
  lastActive?: string 
  completedLoads: number
  status: "active" | "inactive" | "expired" | "cancelled"
  // ... other carrier properties you need
}