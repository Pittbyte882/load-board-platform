import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { messageId, userId } = await request.json()

    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the user is the sender of this message (users can only delete their own messages)
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.sender_id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      )
    }

    // Delete the message
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (deleteError) {
      console.error('Error deleting message:', deleteError)
      throw deleteError
    }

    console.log('✅ Message deleted:', messageId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete message route:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}