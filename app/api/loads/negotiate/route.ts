import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Negotiation request received:', body) // Debug log
    
    const negotiationData = {
      load_id: body.loadId,
      negotiator_id: body.negotiatorId,
      negotiator_name: body.negotiatorName,
      negotiator_company: body.negotiatorCompany,
      negotiator_role: body.negotiatorRole,
      broker_id: body.brokerId,
      broker_name: body.brokerName,
      broker_company: body.brokerCompany,
      original_rate: body.originalRate,
      counter_offer: body.counterOffer,
      message: body.message,
      status: 'pending'
    }
    
    const { data, error } = await supabase
      .from('load_negotiations')
      .insert([negotiationData])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error) // Debug log
      throw error
    }
    
    console.log('Negotiation created:', data) // Debug log
    
    // Create a conversation/message for this negotiation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        load_id: body.loadId,
        load_route: `${body.pickupLocation} → ${body.deliveryLocation}`
      })
      .select()
      .single()
    
    if (convError) {
      console.error('Conversation error:', convError) // Debug log
      throw convError
    }
    
    // Add participants
    const participants = [
      {
        conversation_id: conversation.id,
        user_id: body.negotiatorId,
        user_name: body.negotiatorName,
        user_role: body.negotiatorRole,
        user_company: body.negotiatorCompany
      },
      {
        conversation_id: conversation.id,
        user_id: body.brokerId,
        user_name: body.brokerName,
        user_role: 'broker',
        user_company: body.brokerCompany
      }
    ]
    
    await supabase.from('conversation_participants').insert(participants)
    
    // Send negotiation message
    const messageContent = `Counter Offer: $${body.counterOffer.toLocaleString()}
Original Rate: $${body.originalRate.toLocaleString()}
${body.message ? `\nMessage: ${body.message}` : ''}`
    
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: body.negotiatorId,
      sender_name: body.negotiatorName,
      sender_role: body.negotiatorRole,
      sender_company: body.negotiatorCompany,
      receiver_id: body.brokerId,
      receiver_name: body.brokerName,
      receiver_role: 'broker',
      receiver_company: body.brokerCompany,
      content: messageContent,
      load_id: body.loadId,
      read: false
    })
    
    return NextResponse.json({ 
      success: true, 
      negotiation: data,
      conversationId: conversation.id 
    })
  } catch (error) {
    console.error('Error creating negotiation:', error)
    return NextResponse.json(
      { error: 'Failed to submit negotiation', details: error },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brokerId = searchParams.get('brokerId')
    
    if (!brokerId) {
      return NextResponse.json({ error: 'Broker ID required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('load_negotiations')
      .select('*')
      .eq('broker_id', brokerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ negotiations: data || [] })
  } catch (error) {
    console.error('Error fetching negotiations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch negotiations' },
      { status: 500 }
    )
  }
}