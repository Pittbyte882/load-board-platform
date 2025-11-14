import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const { ticketId, status, assignedTo } = await request.json()

    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticket ID' }, { status: 400 })
    }

    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updates.status = status
    }

    if (assignedTo !== undefined) {
      updates.assigned_to = assignedTo
    }

    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating support ticket:', error)
    return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 })
  }
}