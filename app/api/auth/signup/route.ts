import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, companyName, role, phone } = await request.json()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          role,
          phone,
          status: 'active',
        },
      ])
      .select()
      .single()

    if (error) throw error

    console.log('✅ User created:', newUser.id)

    // Return user data (needed for Stripe checkout)
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
      }
    })
  } catch (error) {
    console.error("❌ Signup error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}