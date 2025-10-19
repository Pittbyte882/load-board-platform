import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create acceptance record with PENDING status
    const acceptanceData = {
      load_id: body.loadId,
      accepted_by_id: body.acceptedById,
      accepted_by_name: body.acceptedByName,
      accepted_by_company: body.acceptedByCompany,
      accepted_by_role: body.acceptedByRole,
      accepted_by_phone: body.acceptedByPhone, // ADD THIS for Pnone #
      accepted_by_mc_number: body.acceptedByMcNumber, // ADD THIS for MC #
      broker_id: body.brokerId,
      accepted_rate: body.acceptedRate,
      approval_status: 'pending' 
    }
    
    const { data: acceptance, error: acceptError } = await supabase
      .from('load_acceptances')
      .insert([acceptanceData])
      .select()
      .single()
    
    if (acceptError) throw acceptError
    
    // DON'T update load status yet - keep it as 'available'
    // Load will be updated to 'booked' only after broker approval
    
    // Create or find conversation
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .eq('load_id', body.loadId)
      .single()
    
    let conversationId = existingConv?.id
    
    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          load_id: body.loadId,
          load_route: `${body.pickupLocation} → ${body.deliveryLocation}`
        })
        .select()
        .single()
      
      if (convError) throw convError
      conversationId = newConv.id
      
      // Add participants
      const participants = [
        {
          conversation_id: conversationId,
          user_id: body.acceptedById,
          user_name: body.acceptedByName,
          user_role: body.acceptedByRole,
          user_company: body.acceptedByCompany
        },
        {
          conversation_id: conversationId,
          user_id: body.brokerId,
          user_name: body.brokerName,
          user_role: 'broker',
          user_company: body.brokerCompany
        }
      ]
      
      await supabase.from('conversation_participants').insert(participants)
    }
    
    // Send acceptance message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: body.acceptedById,
      sender_name: body.acceptedByName,
      sender_role: body.acceptedByRole,
      sender_company: body.acceptedByCompany,
      receiver_id: body.brokerId,
      receiver_name: body.brokerName,
      receiver_role: 'broker',
      receiver_company: body.brokerCompany,
      content: `I'd like to accept this load at $${body.acceptedRate.toLocaleString()}. Pending your approval.`,
      load_id: body.loadId,
      read: false
    })
    
    return NextResponse.json({ 
      success: true, 
      acceptance,
      conversationId,
      message: 'Acceptance request sent to broker. Awaiting approval.'
    })
  } catch (error) {
    console.error('Error accepting load:', error)
    return NextResponse.json(
      { error: 'Failed to accept load' },
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
      .from('load_acceptances')
      .select('*')
      .eq('broker_id', brokerId)
      .order('accepted_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ acceptances: data || [] })
  } catch (error) {
    console.error('Error fetching acceptances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch acceptances' },
      { status: 500 }
    )
  }
}