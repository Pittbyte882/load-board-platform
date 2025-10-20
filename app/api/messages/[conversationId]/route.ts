import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', params.conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      senderRole: msg.sender_role,
      senderCompany: msg.sender_company,
      receiverId: msg.receiver_id,
      receiverName: msg.receiver_name,
      receiverRole: msg.receiver_role,
      receiverCompany: msg.receiver_company,
      content: msg.content,
      timestamp: msg.created_at,
      read: msg.read,
      loadId: msg.load_id,
      conversationId: msg.conversation_id
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const messageData = await request.json()
    
    console.log('📨 Attempting to send message via [conversationId]:', messageData)

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