import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 LOGIN ATTEMPT')
    console.log('📧 Email:', email)
    console.log('🔑 Password length:', password?.length)

    // Find user by email only (don't check password in query)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, company_name, role, phone, is_active, first_login, password')
      .eq('email', email)
      .single()

      console.log('🔍 Supabase error:', error)
    console.log('👤 User found:', user ? 'YES' : 'NO')

    if (user) {
      console.log('📧 DB Email:', user.email)
      console.log('🔐 DB Password exists:', user.password ? 'YES' : 'NO')
      console.log('🔐 DB Password starts with $2b:', user.password?.startsWith('$2b') ? 'YES' : 'NO')
    }
    if (error || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log('🔐 Actual DB Password hash:', user.password)
console.log('🔐 Input password being compared:', password)

    // Compare the plain text password with the hashed password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('🔑 Password comparison result:', isValidPassword)

    if (!isValidPassword) {
      console.log('❌ FAILED: Password mismatch')
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log('✅ LOGIN SUCCESS')

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