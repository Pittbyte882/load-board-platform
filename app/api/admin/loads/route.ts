import { NextResponse } from "next/server"
import { demoLoads } from "@/lib/demo-data"

export async function GET() {
  try {
    // Mock loads data for admin view
    const loads = demoLoads.map((load) => ({
      ...load,
      broker: "Smith Logistics LLC",
      postedDate: "2024-01-15",
      equipmentType: "Box Truck",
    }))

    return NextResponse.json(loads)
  } catch (error) {
    console.error("Error fetching loads:", error)
    return NextResponse.json({ error: "Failed to fetch loads" }, { status: 500 })
  }
}
