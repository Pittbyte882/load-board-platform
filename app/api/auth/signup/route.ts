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
console.log('🔨 Generated hash for password "' + password + '":', hashedPassword)

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

    // Get trial days based on role
    const trialDays = role === 'broker' ? 120 : 7

    // Send welcome email asynchronously (don't wait for it)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        to: email,
        data: {
          userName: `${firstName} ${lastName}`,
          userRole: role,
          trialDays: trialDays,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        },
      }),
    }).catch(err => console.error('Failed to send welcome email:', err))

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