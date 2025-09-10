import { type NextRequest, NextResponse } from "next/server"
import { demoUsers } from "@/lib/demo-data"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user in demo data
    const user = demoUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create user session data (excluding password)
    const { password: _, ...userSession } = user

    // In a real app, you'd create a JWT token or session
    const response = NextResponse.json(userSession)

    // Set a simple session cookie (in production, use proper session management)
    response.cookies.set("user-session", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
