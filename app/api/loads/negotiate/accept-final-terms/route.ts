import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get current user (carrier/dispatcher)
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.id
    const userName = `${session.firstName} ${session.lastName}`.trim()
    const userCompany = session.companyName

    const body = await request.json()
    const { negotiationId, finalRate } = body

    console.log('🎯 Carrier accepting final terms:', { negotiationId, finalRate })

    // Get the negotiation details
    const { data: negotiation, error: getNegError } = await supabase
      .from('load_negotiations')
      .select('*')
      .eq('id', negotiationId)
      .single()

    if (getNegError) throw getNegError

    // Verify this is a broker_accepted negotiation
    if (negotiation.status !== 'broker_accepted') {
      return NextResponse.json({ error: 'This negotiation is not ready for final acceptance' }, { status: 400 })
    }

    // Update the negotiation status to final_accepted
    const { error: updateError } = await supabase
      .from('load_negotiations')
      .update({ 
        status: 'final_accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', negotiationId)

    if (updateError) throw updateError

    // Update the load rate and status to booked
    const { error: loadUpdateError } = await supabase
      .from('loads')
      .update({ 
        rate: finalRate,
        status: 'booked'
      })
      .eq('id', negotiation.load_id)

    if (loadUpdateError) throw loadUpdateError

    // Use TRUE roles if available, otherwise fall back to current roles
    let carrierId, carrierName, carrierCompany, carrierRole
    let brokerId, brokerName, brokerCompany

    if (negotiation.true_carrier_id) {
      // Use the tracked TRUE roles
      carrierId = negotiation.true_carrier_id
      carrierName = negotiation.true_carrier_name
      carrierCompany = negotiation.true_carrier_company
      carrierRole = negotiation.true_carrier_role
      brokerId = negotiation.true_broker_id
      brokerName = negotiation.true_broker_name
      brokerCompany = negotiation.true_broker_company
      
      console.log('✅ Using TRUE roles for booking:', { carrierId, carrierName, carrierRole })
    } else {
      // Fall back to current negotiation roles (for original negotiations)
      if (negotiation.negotiator_role === 'broker') {
        // Broker is negotiator, so broker_id is the carrier
        carrierId = negotiation.broker_id
        carrierName = negotiation.broker_name
        carrierCompany = negotiation.broker_company
        carrierRole = 'carrier'
        brokerId = negotiation.negotiator_id
        brokerName = negotiation.negotiator_name
        brokerCompany = negotiation.negotiator_company
      } else {
        // Carrier/dispatcher is negotiator
        carrierId = negotiation.negotiator_id
        carrierName = negotiation.negotiator_name
        carrierCompany = negotiation.negotiator_company
        carrierRole = negotiation.negotiator_role
        brokerId = negotiation.broker_id
        brokerName = negotiation.broker_name
        brokerCompany = negotiation.broker_company
      }
      
      console.log('✅ Using fallback roles for booking:', { carrierId, carrierName, carrierRole })
    }

    // Create the booking record
    const bookingData = {
      id: `BOOKING-${Date.now()}`,
      load_id: negotiation.load_id,
      carrier_id: carrierId,
      carrier_name: carrierName,
      carrier_company: carrierCompany,
      carrier_role: carrierRole,
      broker_id: brokerId,
      broker_name: brokerName,
      broker_company: brokerCompany,
      booked_rate: finalRate,
      status: 'confirmed',
      booked_at: new Date().toISOString()
    }

    const { error: bookingError } = await supabase
      .from('load_bookings')
      .insert([bookingData])

    if (bookingError) throw bookingError

    console.log('✅ Booking created:', bookingData)

    // Send confirmation message to broker
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('load_id', negotiation.load_id)
      .single()

    if (conversation) {
      const confirmationMessage = `🎉 Load Booked!

${carrierName} has accepted the final terms for load ${negotiation.load_id}.

Final Details:
- Rate: $${finalRate.toLocaleString()}
- Carrier: ${carrierName} (${carrierCompany})
- Status: Confirmed
- Booked: ${new Date().toLocaleString()}

The load is now officially booked and will appear in both parties' Booked Loads sections.`

      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: carrierId,
        sender_name: carrierName,
        sender_role: carrierRole,
        sender_company: carrierCompany,
        receiver_id: brokerId,
        receiver_name: brokerName,
        receiver_role: 'broker',
        receiver_company: brokerCompany,
        content: confirmationMessage,
        load_id: negotiation.load_id,
        read: false
      })
    }

    console.log('✅ Load booked successfully - carrier confirmed final terms')

    return NextResponse.json({ 
      success: true,
      bookingId: bookingData.id,
      loadId: negotiation.load_id
    })
  } catch (error) {
    console.error('❌ Error accepting final terms:', error)
    return NextResponse.json(
      { error: 'Failed to accept final terms' },
      { status: 500 }
    )
  }
}