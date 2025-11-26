import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { negotiationId, response, finalRate } = body

    console.log('📋 Broker responding to negotiation:', { negotiationId, response, finalRate })

    // Get the negotiation details first
    const { data: negotiation, error: getNegError } = await supabase
      .from('load_negotiations')
      .select('*')
      .eq('id', negotiationId)
      .single()

    if (getNegError) throw getNegError

    // Update the negotiation status (but don't book the load yet!)
    const newStatus = response === 'accepted' ? 'broker_accepted' : response
    
    const { error: updateError } = await supabase
      .from('load_negotiations')
      .update({ 
        status: newStatus,
        final_rate: response === 'accepted' ? finalRate : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', negotiationId)

    if (updateError) throw updateError

    // Send notification message (but don't book yet)
    if (response === 'accepted') {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('load_id', negotiation.load_id)
        .single()

      if (conversation) {
        const notificationMessage = `✅ Offer Accepted!

Your negotiation for ${negotiation.load_id} has been accepted at $${finalRate.toLocaleString()}.

⚡ NEXT STEP: Go to your Negotiations tab and click "Accept Final Terms" to book this load.

Load Details:
- Final Rate: $${finalRate.toLocaleString()}
- Status: Waiting for your confirmation`

        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_id: negotiation.broker_id,
          sender_name: negotiation.broker_name,
          sender_role: 'broker',
          sender_company: negotiation.broker_company,
          receiver_id: negotiation.negotiator_id,
          receiver_name: negotiation.negotiator_name,
          receiver_role: negotiation.negotiator_role,
          receiver_company: negotiation.negotiator_company,
          content: notificationMessage,
          load_id: negotiation.load_id,
          read: false
        })
      }
    }

    console.log(`✅ Negotiation ${response} - awaiting carrier confirmation`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error processing negotiation response:', error)
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    )
  }
}