import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { acceptanceId, brokerId, action } = await request.json()
    
    if (action === 'approve') {
      // Update acceptance to approved
      const { data: acceptance, error: updateError } = await supabase
        .from('load_acceptances')
        .update({ 
          approval_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', acceptanceId)
        .eq('broker_id', brokerId)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // Update load status to booked
      const { error: loadError } = await supabase
        .from('loads')
        .update({ status: 'booked' })
        .eq('id', acceptance.load_id)
      
      if (loadError) throw loadError
      
      // Send approval message
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('load_id', acceptance.load_id)
        .single()
      
      if (conversation) {
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_id: brokerId,
          sender_name: 'Broker', // You can pass actual broker name
          sender_role: 'broker',
          sender_company: 'Broker Company',
          receiver_id: acceptance.accepted_by_id,
          receiver_name: acceptance.accepted_by_name,
          receiver_role: acceptance.accepted_by_role,
          receiver_company: acceptance.accepted_by_company,
          content: `Load acceptance approved! The load is now confirmed at $${acceptance.accepted_rate.toLocaleString()}.`,
          load_id: acceptance.load_id,
          read: false
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Acceptance approved successfully'
      })
    } else if (action === 'decline') {
      // Update acceptance to declined
      const { data: acceptance, error: updateError } = await supabase
        .from('load_acceptances')
        .update({ approval_status: 'declined' })
        .eq('id', acceptanceId)
        .eq('broker_id', brokerId)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // Send decline message
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('load_id', acceptance.load_id)
        .single()
      
      if (conversation) {
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_id: brokerId,
          sender_name: 'Broker',
          sender_role: 'broker',
          sender_company: 'Broker Company',
          receiver_id: acceptance.accepted_by_id,
          receiver_name: acceptance.accepted_by_name,
          receiver_role: acceptance.accepted_by_role,
          receiver_company: acceptance.accepted_by_company,
          content: 'Thank you for your interest. We have decided to go with another carrier for this load.',
          load_id: acceptance.load_id,
          read: false
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Acceptance declined'
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}