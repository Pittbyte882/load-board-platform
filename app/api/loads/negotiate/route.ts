import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 API CALLED - negotiate route')
  console.log('🔍 Full URL:', request.url)
  
  try {
    const { searchParams } = new URL(request.url)
    const brokerId = searchParams.get('brokerId')
    const carrierId = searchParams.get('carrierId')
    
    console.log('🔍 Parsed params - brokerId:', brokerId, 'carrierId:', carrierId)
    
    if (!brokerId && !carrierId) {
      console.log('❌ Missing both IDs - returning 400')
      return NextResponse.json({ error: 'Broker ID or Carrier ID required' }, { status: 400 })
    }

    let negotiations = []

    if (brokerId) {
      // Broker viewing negotiations - they see negotiations where they are the broker
      console.log('📋 Fetching negotiations for broker:', brokerId)
      
      const { data, error } = await supabase
        .from('load_negotiations')
        .select('*')
        .eq('broker_id', brokerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      negotiations = data || []
      console.log(`✅ Found ${negotiations.length} negotiations for broker`)
    } 
    
    if (carrierId) {
      // Carrier/dispatcher viewing negotiations
      console.log('🚛 Fetching negotiations for carrier/dispatcher:', carrierId)
      
      // Get negotiations where they are the negotiator (they initiated)
      const { data: asNegotiator, error: error1 } = await supabase
        .from('load_negotiations')
        .select('*')
        .eq('negotiator_id', carrierId)
        .order('created_at', { ascending: false })

      // Get negotiations where they are the broker in swapped roles (broker countered them)
      const { data: asBroker, error: error2 } = await supabase
        .from('load_negotiations')
        .select('*')
        .eq('broker_id', carrierId)
        .order('created_at', { ascending: false })

      if (error1 || error2) {
        console.error('Error fetching negotiations:', error1 || error2)
        throw error1 || error2
      }

      // Combine and deduplicate by load_id (keep most recent status for each load)
      const allNegotiations = [...(asNegotiator || []), ...(asBroker || [])]
      
      // Group by load_id and keep the most recent one
      const negotiationMap = new Map()
      allNegotiations.forEach(neg => {
        const existing = negotiationMap.get(neg.load_id)
        if (!existing || new Date(neg.created_at) > new Date(existing.created_at)) {
          negotiationMap.set(neg.load_id, neg)
        }
      })
      
      negotiations = Array.from(negotiationMap.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      console.log('🔍 Found as negotiator:', asNegotiator?.length || 0)
      console.log('🔍 Found as broker:', asBroker?.length || 0)
      console.log(`✅ Returning ${negotiations.length} unique negotiations after deduplication`)
    }

    return NextResponse.json({ 
      negotiations: negotiations,
      success: true 
    })
  } catch (error) {
    console.error('❌ Error fetching negotiations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch negotiations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('💼 Creating new negotiation:', body)

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
      message: body.message || '',
      status: 'pending'
    }
    
    const { data, error } = await supabase
      .from('load_negotiations')
      .insert([negotiationData])
      .select()
      .single()
    
    if (error) throw error
    
    console.log('✅ Negotiation created:', data.id)

    // Create a conversation/message for this negotiation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        load_id: body.loadId,
        load_route: `${body.pickupLocation} → ${body.deliveryLocation}`
      })
      .select()
      .single()
    
    if (!convError && conversation) {
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
    }
    
    return NextResponse.json({ 
      success: true, 
      negotiation: data,
      conversationId: conversation?.id 
    })
  } catch (error) {
    console.error('❌ Error creating negotiation:', error)
    return NextResponse.json(
      { error: 'Failed to create negotiation' },
      { status: 500 }
    )
  }
}