import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    console.log('✅ User deleted support ticket:', ticketId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting support ticket:', error)
    return NextResponse.json({ error: 'Failed to delete support ticket' }, { status: 500 })
  }
}