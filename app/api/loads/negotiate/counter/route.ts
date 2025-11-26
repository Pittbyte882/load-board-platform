import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      originalNegotiationId,
      loadId,
      brokerId,
      brokerName,
      brokerCompany,
      negotiatorId,
      negotiatorName,
      negotiatorCompany,
      negotiatorRole,
      originalRate,
      theirOffer,
      myCounterOffer,
      message
    } = body

    console.log('💰 Broker sending counter offer:', {
      originalNegotiationId,
      loadId,
      myCounterOffer
    })

    // Get the ORIGINAL negotiation to preserve true roles
    const { data: originalNeg, error: getOriginalError } = await supabase
      .from('load_negotiations')
      .select('*')
      .eq('id', originalNegotiationId)
      .single()

    if (getOriginalError) throw getOriginalError

    // Determine who the TRUE carrier/dispatcher is (the one who should get the load)
    let trueCarrier, trueBroker

    // If original negotiation already has true roles (from previous counters), use those
    if (originalNeg.true_carrier_id) {
      trueCarrier = {
        id: originalNeg.true_carrier_id,
        name: originalNeg.true_carrier_name,
        company: originalNeg.true_carrier_company,
        role: originalNeg.true_carrier_role
      }
      trueBroker = {
        id: originalNeg.true_broker_id,
        name: originalNeg.true_broker_name,
        company: originalNeg.true_broker_company,
        role: 'broker'
      }
    } else {
      // This is the first counter-offer, determine true roles from original negotiation
      if (originalNeg.negotiator_role === 'broker') {
        // Original negotiation had broker as negotiator, so broker_id is the true carrier
        trueCarrier = {
          id: originalNeg.broker_id,
          name: originalNeg.broker_name,
          company: originalNeg.broker_company,
          role: 'carrier' // Assuming non-broker role
        }
        trueBroker = {
          id: originalNeg.negotiator_id,
          name: originalNeg.negotiator_name,
          company: originalNeg.negotiator_company,
          role: 'broker'
        }
      } else {
        // Original negotiation had carrier/dispatcher as negotiator
        trueCarrier = {
          id: originalNeg.negotiator_id,
          name: originalNeg.negotiator_name,
          company: originalNeg.negotiator_company,
          role: originalNeg.negotiator_role
        }
        trueBroker = {
          id: originalNeg.broker_id,
          name: originalNeg.broker_name,
          company: originalNeg.broker_company,
          role: 'broker'
        }
      }
    }

    // Mark the original negotiation as countered
    const { error: updateOriginalError } = await supabase
      .from('load_negotiations')
      .update({ 
        status: 'countered',
        updated_at: new Date().toISOString()
      })
      .eq('id', originalNegotiationId)

    if (updateOriginalError) throw updateOriginalError

    // Create a new negotiation record for the broker's counter offer
    const counterNegotiationData = {
      load_id: loadId,
      negotiator_id: brokerId,
      negotiator_name: brokerName,
      negotiator_company: brokerCompany,
      negotiator_role: 'broker',
      broker_id: negotiatorId, // Swap roles for this specific negotiation
      broker_name: negotiatorName,
      broker_company: negotiatorCompany,
      original_rate: theirOffer,
      counter_offer: myCounterOffer,
      message: message || `Counter offer from ${brokerName}: $${myCounterOffer.toLocaleString()}`,
      status: 'pending',
      // Preserve the TRUE roles for booking purposes
      true_carrier_id: trueCarrier.id,
      true_carrier_name: trueCarrier.name,
      true_carrier_company: trueCarrier.company,
      true_carrier_role: trueCarrier.role,
      true_broker_id: trueBroker.id,
      true_broker_name: trueBroker.name,
      true_broker_company: trueBroker.company
    }

    const { data: counterNegotiation, error: counterError } = await supabase
      .from('load_negotiations')
      .insert([counterNegotiationData])
      .select()
      .single()

    if (counterError) throw counterError

    // Create or find conversation for this counter offer
    let conversationId: string

    const { data: existingConv, error: findError } = await supabase
      .from('conversations')
      .select('id')
      .eq('load_id', loadId)
      .single()

    if (existingConv) {
      conversationId = existingConv.id
      console.log('✅ Using existing conversation:', conversationId)
    } else {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          load_id: loadId,
          load_route: `Counter Negotiation - ${loadId}`
        })
        .select()
        .single()

      if (convError) throw convError

      conversationId = newConv.id
      console.log('✅ Created new conversation:', conversationId)

      // Add participants
      const participants = [
        {
          conversation_id: conversationId,
          user_id: brokerId,
          user_name: brokerName,
          user_role: 'broker',
          user_company: brokerCompany
        },
        {
          conversation_id: conversationId,
          user_id: negotiatorId,
          user_name: negotiatorName,
          user_role: negotiatorRole,
          user_company: negotiatorCompany
        }
      ]

      await supabase.from('conversation_participants').insert(participants)
    }

    // Send counter offer message
    const messageContent = `Counter Offer: $${myCounterOffer.toLocaleString()}
Original Rate: $${originalRate.toLocaleString()}
Your Offer: $${theirOffer.toLocaleString()}
My Counter: $${myCounterOffer.toLocaleString()}
${message ? `\nMessage: ${message}` : ''}`

    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: brokerId,
        sender_name: brokerName,
        sender_role: 'broker',
        sender_company: brokerCompany,
        receiver_id: negotiatorId,
        receiver_name: negotiatorName,
        receiver_role: negotiatorRole,
        receiver_company: negotiatorCompany,
        content: messageContent,
        load_id: loadId,
        read: false
      })

    if (msgError) throw msgError

    console.log('✅ Counter offer sent successfully')

    return NextResponse.json({ 
      success: true,
      negotiationId: counterNegotiation.id,
      conversationId
    })
  } catch (error) {
    console.error('❌ Error sending counter offer:', error)
    return NextResponse.json(
      { error: 'Failed to send counter offer' },
      { status: 500 }
    )
  }
}