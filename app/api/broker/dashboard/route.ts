import { NextResponse } from 'next/server'

export async function GET() {
  // Get user from auth token/session
  // Connect to your database
  // Fetch real data
  
  // For now, return sample data with proper structure
  return NextResponse.json({
    stats: {
      totalRevenue: 45250,
      activeLoads: 8,
      completedLoads: 142,
      averageRate: 2.35,
    },
    recentLoads: [
      {
        id: "LD-001",
        origin: "Chicago, IL",
        destination: "Atlanta, GA",
        pickupDate: "2024-01-15",
        deliveryDate: "2024-01-17",
        equipmentType: "26ft Box Truck",
        weight: 15000,
        rate: 1800,
        distance: 716,  // Chicago to Atlanta actual distance
        commodity: "Electronics",
        status: "available"
      },
      {
        id: "LD-002",
        origin: "Los Angeles, CA",
        destination: "Phoenix, AZ",
        pickupDate: "2024-01-16",
        deliveryDate: "2024-01-17",
        equipmentType: "Sprinter Van",
        weight: 3000,
        rate: 850,
        distance: 357,  // LA to Phoenix actual distance
        commodity: "Medical Supplies",
        status: "in-transit"
      },
      {
        id: "LD-003",
        origin: "Dallas, TX",
        destination: "Houston, TX",
        pickupDate: "2024-01-18",
        deliveryDate: "2024-01-18",
        equipmentType: "Cargo Van",
        weight: 2000,
        rate: 450,
        distance: 239,  // Dallas to Houston actual distance
        commodity: "Documents",
        status: "available"
      }
    ]
  })
}