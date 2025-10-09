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