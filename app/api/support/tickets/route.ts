// /app/api/support/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_replies (
          id,
          ticket_id,
          sender_id,
          sender_name,
          sender_type,
          message,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform the data to match your frontend expectations
    const transformedTickets = tickets?.map(ticket => ({
      ...ticket,
      responses: ticket.support_replies || [],
      id: ticket.id,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
    })) || []

    return NextResponse.json(transformedTickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}