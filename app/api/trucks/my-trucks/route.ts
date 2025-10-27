import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get user from session - CHANGED TO 'user-session'
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    // Fetch trucks belonging to this user
    const { data: trucks, error } = await supabase
      .from('trucks')
      .select('*')
      .eq('carrier_id', userId)
      .order('posted_date', { ascending: false })

    if (error) {
      console.error('Error fetching my trucks:', error)
      throw error
    }

    console.log(`✅ Fetched ${trucks?.length || 0} trucks for user ${userId}`)

    return NextResponse.json(trucks || [])
  } catch (error) {
    console.error('Error in my-trucks route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trucks' },
      { status: 500 }
    )
  }
}