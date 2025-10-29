import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get user from cookies/session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse session to get user ID
    const session = JSON.parse(sessionCookie.value)
    const userId = session.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    // Fetch all load acceptances for this dispatcher
    // Join with loads table to get full load details
    const { data: acceptances, error: acceptancesError } = await supabase
      .from('load_acceptances')
      .select('*')
      .eq('accepted_by_id', userId)
      .order('accepted_at', { ascending: false })

    if (acceptancesError) {
      console.error('Error fetching load acceptances:', acceptancesError)
      throw acceptancesError
    }

    // If no acceptances found, return empty array
    if (!acceptances || acceptances.length === 0) {
      return NextResponse.json([])
    }

    // Get all unique load IDs
    const loadIds = acceptances.map(acc => acc.load_id)

    // Fetch full load details for all accepted loads
    const { data: loads, error: loadsError } = await supabase
      .from('loads')
      .select('*')
      .in('id', loadIds)

    if (loadsError) {
      console.error('Error fetching loads:', loadsError)
      throw loadsError
    }

    // Create a map of loads by ID for easy lookup
    const loadsMap = new Map()
    if (loads) {
      loads.forEach(load => loadsMap.set(load.id, load))
    }

    // Combine acceptance data with load data
    const bookedLoads = acceptances.map(acceptance => {
      const load = loadsMap.get(acceptance.load_id)
      
      return {
        // Acceptance fields
        id: acceptance.id,
        load_id: acceptance.load_id,
        broker_id: acceptance.broker_id,
        accepted_rate: acceptance.accepted_rate,
        approval_status: acceptance.approval_status,
        accepted_at: acceptance.accepted_at,
        approved_at: acceptance.approved_at,
        accepted_by_phone: acceptance.accepted_by_phone,
        accepted_by_mc_number: acceptance.accepted_by_mc_number,
        
        // Load fields (with fallbacks if load not found)
        broker_name: load?.broker_name || 'N/A',
        broker_company: load?.broker_company || 'N/A',
        broker_mc: load?.broker_mc || 'N/A',
        origin: load?.origin || 'N/A',
        destination: load?.destination || 'N/A',
        pickup_location: load?.pickup_location || 'N/A',
        delivery_location: load?.delivery_location || 'N/A',
        pickup_date: load?.pickup_date || new Date().toISOString(),
        delivery_date: load?.delivery_date || new Date().toISOString(),
        weight: load?.weight || 0,
        distance: load?.distance || 0,
        equipment_type: load?.equipment_type || 'N/A',
        load_type: load?.load_type || 'N/A',
        description: load?.description || '',
        expedited: load?.expedited || false,
        hazmat: load?.hazmat || false,
        team_driver: load?.team_driver || false,
      }
    })

    console.log(`Fetched ${bookedLoads.length} booked loads for dispatcher ${userId}`)
    
    return NextResponse.json(bookedLoads)
  } catch (error) {
    console.error('Error in booked-loads API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booked loads' },
      { status: 500 }
    )
  }
}
