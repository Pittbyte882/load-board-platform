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
      truckDetails 
    } = body

    console.log('📨 Creating truck conversation:', {
      broker: brokerName,
      carrier: carrierName,
      truckId
    })

    // Create or find conversation for this truck
    let conversationId: string

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

      // Add broker as participant
      await supabase.from('conversation_participants').insert({
        conversation_id: conversationId,
        user_id: brokerId,
        user_name: brokerName,
        user_role: 'broker',
        user_company: brokerCompany
      })

      // Add carrier/dispatcher as participant
      await supabase.from('conversation_participants').insert({
        conversation_id: conversationId,
        user_id: carrierId,
        user_name: carrierName,
        user_role: carrierRole,
        user_company: carrierCompany
      })
    }

    // Create initial message
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

    console.log('✅ Message sent successfully')

    return NextResponse.json({ 
      conversationId,
      messageId: message.id,
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