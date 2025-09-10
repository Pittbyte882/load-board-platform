import { NextResponse } from "next/server"
import { demoUsers, demoLoads } from "@/lib/demo-data"

export async function GET() {
  try {
    const stats = {
      totalUsers: demoUsers.length,
      totalLoads: demoLoads.length,
      totalRevenue: 2450000,
      activeLoads: demoLoads.filter((load) => load.status === "available" || load.status === "in-transit").length,
      brokers: demoUsers.filter((user) => user.role === "broker").length,
      carriers: demoUsers.filter((user) => user.role === "carrier").length,
      dispatchers: demoUsers.filter((user) => user.role === "dispatcher").length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
