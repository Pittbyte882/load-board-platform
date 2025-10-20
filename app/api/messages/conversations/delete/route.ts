import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { conversationId, userId } = await request.json()

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user is a participant in this conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      )
    }

    // Delete the conversation (CASCADE will delete messages and participants)
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError)
      throw deleteError
    }

    console.log('✅ Conversation deleted:', conversationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete conversation route:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}
