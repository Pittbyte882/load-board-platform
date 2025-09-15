import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user in Supabase database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, company_name, role, phone, is_active, first_login')
      .eq('email', email)
      .eq('password', password)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Convert database field names to match your existing format
    const userSession = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      companyName: user.company_name,
      role: user.role,
      phone: user.phone,
      isActive: user.is_active,
      firstLogin: user.first_login
    }

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