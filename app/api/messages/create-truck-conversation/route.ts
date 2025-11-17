import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get current user (broker)
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const brokerId = session.id
    const brokerName = `${session.firstName} ${session.lastName}`.trim()
    const brokerCompany = session.companyName

    const body = await request.json()
    const { 
      carrierId, 
      carrierName, 
      carrierCompany, 
      carrierRole,
      truckId,
      truckDetails,
      skipInitialMessage = false
    } = body

    console.log('📨 Creating truck conversation:', {
      broker: brokerName,
      carrier: carrierName,
      truckId,
      skipInitialMessage
    })

    let conversationId: string
    let messageId: string | null = null

    // Check if conversation already exists for this truck
    const { data: existingConv, error: findError } = await supabase
      .from('conversations')
      .select('id')
      .eq('load_id', `TRUCK-${truckId}`)
      .single()

    if (existingConv) {
      conversationId = existingConv.id
      console.log('✅ Found existing conversation:', conversationId)
    } else {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          load_id: `TRUCK-${truckId}`,
          load_route: `${truckDetails.equipmentType} - ${truckDetails.location}`
        })
        .select()
        .single()

      if (convError) throw convError

      conversationId = newConv.id
      console.log('✅ Created new conversation:', conversationId)
    }

    // After getting or creating conversationId, always ensure participants exist
    console.log('🔄 Ensuring participants exist for conversation:', conversationId)

    // Check if broker is already a participant
    const { data: existingBrokerParticipant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', brokerId)
      .single()

    if (!existingBrokerParticipant) {
      const { error: brokerParticipantError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: brokerId,
          user_name: brokerName,
          user_role: 'broker',
          user_company: brokerCompany
        })

      if (brokerParticipantError) {
        console.error('❌ Error adding broker as participant:', brokerParticipantError)
        throw brokerParticipantError
      }
      console.log('✅ Broker added as participant')
    } else {
      console.log('✅ Broker already a participant')
    }

    // Check if carrier is already a participant  
    const { data: existingCarrierParticipant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', carrierId)
      .single()

    if (!existingCarrierParticipant) {
      const { error: carrierParticipantError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: carrierId,
          user_name: carrierName,
          user_role: carrierRole,
          user_company: carrierCompany
        })

      if (carrierParticipantError) {
        console.error('❌ Error adding carrier as participant:', carrierParticipantError)
        throw carrierParticipantError
      }
      console.log('✅ Carrier added as participant')
    } else {
      console.log('✅ Carrier already a participant')
    }

    // Only send initial message if not skipping
    if (!skipInitialMessage) {
      const messageContent = `Hi ${carrierName},\n\nI'm interested in your ${truckDetails.equipmentType} available in ${truckDetails.location} on ${new Date(truckDetails.availableDate).toLocaleDateString()}.\n\nDOT: ${truckDetails.dotNumber}\nMC: ${truckDetails.mcNumber}\n\nPlease let me know if this truck is still available.`

      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: brokerId,
          sender_name: brokerName,
          sender_role: 'broker',
          sender_company: brokerCompany,
          receiver_id: carrierId,
          receiver_name: carrierName,
          receiver_role: carrierRole,
          receiver_company: carrierCompany,
          content: messageContent,
          load_id: `TRUCK-${truckId}`,
          read: false
        })
        .select()
        .single()

      if (msgError) throw msgError
      
      messageId = message.id
      console.log('✅ Initial message sent successfully')
    } else {
      console.log('✅ Conversation created without initial message')
    }

    return NextResponse.json({ 
      conversationId,
      messageId,
      success: true 
    })
  } catch (error) {
    console.error('❌ Error creating truck conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}