import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const loadId = request.nextUrl.searchParams.get('loadId')
    
    console.log('🔍 Looking for conversation with loadId:', loadId)
    
    if (!loadId) {
      return NextResponse.json({ error: 'Load ID required' }, { status: 400 })
    }

    // Changed from .single() to get array and take first result
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('load_id', loadId)
      .order('created_at', { ascending: false })  // Get most recent first
      .limit(1)

    console.log('📊 Conversations found:', conversations)
    console.log('❌ Error if any:', error)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Error finding conversation',
        details: error.message 
      }, { status: 500 })
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ 
        error: 'No conversation exists for this load',
        loadId 
      }, { status: 404 })
    }

    // Return the most recent conversation
    return NextResponse.json({ conversationId: conversations[0].id })
  } catch (error) {
    console.error('Error finding conversation:', error)
    return NextResponse.json({ 
      error: 'Failed to find conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}