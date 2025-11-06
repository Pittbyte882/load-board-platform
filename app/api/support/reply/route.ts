import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { ticketId, senderId, senderName, senderType, message } = await request.json()

    if (!ticketId || !senderId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get ticket info
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*, users!inner(email, first_name, last_name)')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Create reply in database
    const { data: reply, error: replyError } = await supabase
      .from('support_replies')
      .insert([
        {
          ticket_id: ticketId,
          sender_id: senderId,
          sender_name: senderName,
          sender_type: senderType,
          message: message,
        },
      ])
      .select()
      .single()

    if (replyError) throw replyError

    console.log('✅ Support reply created:', reply.id)

    // Only send email if reply is from admin to user
    if (senderType === 'admin') {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'support-reply',
          to: ticket.users.email,
          data: {
            userName: `${ticket.users.first_name} ${ticket.users.last_name}`,
            ticketId: ticketId,
            subject: ticket.subject,
            replyMessage: message,
            supportAgentName: senderName,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          },
        }),
      }).catch(err => console.error('Failed to send reply email:', err))
    }

    return NextResponse.json({
      success: true,
      reply: reply,
    })
  } catch (error) {
    console.error("❌ Error creating reply:", error)
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    )
  }
}