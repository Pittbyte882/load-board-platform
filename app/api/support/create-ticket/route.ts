import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { userId, subject, message, priority } = await request.json()

    if (!userId || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create support ticket in database
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert([
        {
          user_id: userId,
          subject: subject,
          message: message,
          priority: priority || 'medium',
          status: 'open',
        },
      ])
      .select()
      .single()

    if (ticketError) throw ticketError

    console.log('✅ Support ticket created:', ticket.id)

    // Send confirmation email asynchronously
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'support-ticket-created',
        to: user.email,
        data: {
          userName: `${user.first_name} ${user.last_name}`,
          ticketId: ticket.id,
          subject: subject,
          message: message,
          priority: priority || 'medium',
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      }),
    }).catch(err => console.error('Failed to send ticket confirmation email:', err))

    return NextResponse.json({
      success: true,
      ticket: ticket,
    })
  } catch (error) {
    console.error("❌ Error creating ticket:", error)
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    )
  }
}