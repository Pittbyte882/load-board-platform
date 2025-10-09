import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get conversations where user is a participant
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId)

    if (participantError) throw participantError

    const conversationIds = participantData.map(p => p.conversation_id)

    if (conversationIds.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    // Get conversation details
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)

    if (convError) throw convError

    // Get all participants for these conversations
    const { data: allParticipants, error: allParticipantsError } = await supabase
      .from('conversation_participants')
      .select('*')
      .in('conversation_id', conversationIds)

    if (allParticipantsError) throw allParticipantsError

    // Get last message for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('receiver_id', userId)
          .eq('read', false)

        // Get participants for this conversation
        const participants = allParticipants
          .filter(p => p.conversation_id === conv.id)
          .map(p => ({
            id: p.user_id,
            name: p.user_name,
            role: p.user_role,
            company: p.user_company,
            mcNumber: p.mc_number
          }))

        return {
          id: conv.id,
          participants,
          lastMessage: lastMessage?.content || '',
          lastMessageTime: lastMessage?.created_at || conv.created_at,
          unreadCount: unreadCount || 0,
          loadId: conv.load_id,
          loadRoute: conv.load_route
        }
      })
    )

    return NextResponse.json({ conversations: conversationsWithDetails })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const { participants, loadId, loadRoute } = await request.json()

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        load_id: loadId,
        load_route: loadRoute
      })
      .select()
      .single()

    if (convError) throw convError

    // Add participants
    const participantInserts = participants.map((p: any) => ({
      conversation_id: conversation.id,
      user_id: p.id,
      user_name: p.name,
      user_role: p.role,
      user_company: p.company,
      mc_number: p.mcNumber
    }))

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participantInserts)

    if (participantError) throw participantError

    return NextResponse.json({ conversationId: conversation.id })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}