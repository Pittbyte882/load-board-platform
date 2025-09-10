import { NextResponse } from "next/server"
import { demoUsers } from "@/lib/demo-data"

export async function GET() {
  try {
    // Return users without passwords
    const users = demoUsers.map(({ password, ...user }) => ({
      ...user,
      joinDate: "Jan 2024",
      lastActive: "2 hours ago",
      status: "active" as const,
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
