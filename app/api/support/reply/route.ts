import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { ticketId, senderId, senderName, senderType, message } = await request.json()

    if (!ticketId || !senderId || !senderName || !senderType || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Add the reply to the database
    const { data: reply, error: replyError } = await supabase
      .from('support_replies')
      .insert([{
        ticket_id: ticketId,
        sender_id: senderId,
        sender_name: senderName,
        sender_type: senderType,
        message: message.trim(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (replyError) throw replyError

    // Update the ticket's updated_at timestamp
    const { error: updateError } = await supabase
      .from('support_tickets')
      .update({ 
        updated_at: new Date().toISOString(),
        status: senderType === 'admin' ? 'in_progress' : 'open' // Auto-update status
      })
      .eq('id', ticketId)

    if (updateError) throw updateError

    // Get ticket info for notifications
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(`
        *,
        users!inner(email, first_name, last_name)
      `)
      .eq('id', ticketId)
      .single()

    if (ticketError) throw ticketError

    // Send email notification to user (if admin replied) or admin (if user replied)
    if (senderType === 'admin') {
      // Admin replied - notify the customer
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'support-reply',
          to: ticket.users.email,
          data: {
            userName: `${ticket.users.first_name} ${ticket.users.last_name}`,
            ticketSubject: ticket.subject,
            replyMessage: message,
            ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, // Link to their dashboard
            supportTeamName: senderName
          },
        }),
      }).catch(err => console.error('Failed to send support reply email:', err))
    } else {
      // User replied - notify admin (optional)
      console.log('🔔 User replied to ticket:', ticketId, '- Admin should check dashboard')
    }

    console.log('✅ Support reply added:', reply.id)

    return NextResponse.json({ 
      success: true, 
      reply: {
        id: reply.id,
        message: reply.message,
        senderName: reply.sender_name,
        senderType: reply.sender_type,
        timestamp: reply.created_at
      }
    })
  } catch (error) {
    console.error('Error adding support reply:', error)
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 })
  }
}