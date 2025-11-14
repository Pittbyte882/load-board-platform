import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // optional filter

    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        support_replies(
          id,
          ticket_id,
          sender_id,
          sender_name,
          sender_type,
          message,
          created_at
        )
      `)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: tickets, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    // Transform data to match frontend expectations
    const transformedTickets = tickets?.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      message: ticket.message,
      priority: ticket.priority,
      status: ticket.status,
      userId: ticket.user_id,
      userName: `${ticket.users.first_name} ${ticket.users.last_name}`,
      userEmail: ticket.users.email,
      userRole: ticket.users.role,
      assignedTo: ticket.assigned_to,
      createdAt: new Date(ticket.created_at).toLocaleDateString(),
      updatedAt: new Date(ticket.updated_at || ticket.created_at).toLocaleDateString(),
      responses: ticket.support_replies?.map(reply => ({
        id: reply.id,
        ticketId: reply.ticket_id,
        senderId: reply.sender_id,
        senderName: reply.sender_name,
        senderType: reply.sender_type,
        message: reply.message,
        timestamp: new Date(reply.created_at).toLocaleDateString()
      })) || []
    })) || []

    return NextResponse.json(transformedTickets)
  } catch (error) {
    console.error('Error fetching admin support tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')

    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticket ID' }, { status: 400 })
    }

    // Delete replies first (foreign key constraint)
    await supabase
      .from('support_replies')
      .delete()
      .eq('ticket_id', ticketId)

    // Delete the ticket
    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', ticketId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting support ticket:', error)
    return NextResponse.json({ error: 'Failed to delete support ticket' }, { status: 500 })
  }
}