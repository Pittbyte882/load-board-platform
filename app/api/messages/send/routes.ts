import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const messageData = await request.json()
    
    console.log('📨 Attempting to send message:', messageData)

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: messageData.conversationId,
        sender_id: messageData.senderId,
        sender_name: messageData.senderName,
        sender_role: messageData.senderRole,
        sender_company: messageData.senderCompany,
        receiver_id: messageData.receiverId,
        receiver_name: messageData.receiverName,
        receiver_role: messageData.receiverRole,
        receiver_company: messageData.receiverCompany,
        content: messageData.content,
        load_id: messageData.loadId,
        read: false
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      throw error
    }

    console.log('✅ Message sent successfully:', message.id)

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', messageData.conversationId)

    return NextResponse.json({ message })
  } catch (error) {
    console.error('❌ Error sending message:', error)
    return NextResponse.json({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}