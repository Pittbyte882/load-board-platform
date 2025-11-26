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

    console.log('📋 Fetching booked loads for dispatcher:', userId)

    // FETCH FROM BOTH TABLES

    // 1. Get bookings from load_bookings (negotiation flow)
    const { data: bookings, error: bookingsError } = await supabase
      .from('load_bookings')
      .select('*')
      .eq('carrier_id', userId)
      .order('booked_at', { ascending: false })

    if (bookingsError) {
      console.error('Error fetching load bookings:', bookingsError)
    }

    // 2. Get acceptances from load_acceptances (direct acceptance flow)
    const { data: acceptances, error: acceptancesError } = await supabase
      .from('load_acceptances')
      .select('*')
      .eq('accepted_by_id', userId)
      .order('accepted_at', { ascending: false })

    if (acceptancesError) {
      console.error('Error fetching load acceptances:', acceptancesError)
    }

    console.log(`Found ${bookings?.length || 0} bookings and ${acceptances?.length || 0} acceptances`)

    // Get all unique load IDs from BOTH sources
    const loadIdsFromBookings = (bookings || []).map(b => b.load_id)
    const loadIdsFromAcceptances = (acceptances || []).map(a => a.load_id)
    const allLoadIds = [...new Set([...loadIdsFromBookings, ...loadIdsFromAcceptances])]

    if (allLoadIds.length === 0) {
      console.log('No loads found')
      return NextResponse.json([])
    }

    // Fetch full load details
    const { data: loads, error: loadsError } = await supabase
      .from('loads')
      .select('*')
      .in('id', allLoadIds)

    if (loadsError) {
      console.error('Error fetching loads:', loadsError)
      throw loadsError
    }

    // Create a map of loads by ID for easy lookup
    const loadsMap = new Map()
    if (loads) {
      loads.forEach(load => loadsMap.set(load.id, load))
    }

    // COMBINE BOTH SOURCES INTO ONE LIST
    const bookedLoads: any[] = []

    // Add bookings from load_bookings
    if (bookings && bookings.length > 0) {
      bookings.forEach(booking => {
        const load = loadsMap.get(booking.load_id)
        bookedLoads.push({
          id: booking.id,
          load_id: booking.load_id,
          broker_id: booking.broker_id,
          broker_name: booking.broker_name,
          broker_company: booking.broker_company,
          broker_mc: load?.broker_mc_number || load?.broker_mc || 'N/A',
          accepted_rate: booking.booked_rate,
          approval_status: 'approved',
          accepted_at: booking.booked_at,
          approved_at: booking.booked_at,
          source: 'negotiation',
          origin: load?.origin,
          destination: load?.destination,
          pickup_location: load?.pickup_location,
          delivery_location: load?.delivery_location,
          pickup_date: load?.pickup_date,
          delivery_date: load?.delivery_date,
          weight: load?.weight,
          distance: load?.distance,
          equipment_type: load?.equipment_type || load?.equipment,
          load_type: load?.load_type,
          description: load?.description,
          expedited: load?.expedited,
          hazmat: load?.hazmat,
          team_driver: load?.team_driver,
        })
      })
    }

    // Add acceptances from load_acceptances
    if (acceptances && acceptances.length > 0) {
      acceptances.forEach(acceptance => {
        const load = loadsMap.get(acceptance.load_id)
        bookedLoads.push({
          id: acceptance.id,
          load_id: acceptance.load_id,
          broker_id: acceptance.broker_id,
          broker_name: load?.broker_name || 'N/A',
          broker_company: load?.broker_company || 'N/A',
          broker_mc: load?.broker_mc || 'N/A',
          accepted_rate: acceptance.accepted_rate,
          approval_status: acceptance.approval_status,
          accepted_at: acceptance.accepted_at,
          approved_at: acceptance.approved_at,
          accepted_by_phone: acceptance.accepted_by_phone,
          accepted_by_mc_number: acceptance.accepted_by_mc_number,
          source: 'direct',
          origin: load?.origin,
          destination: load?.destination,
          pickup_location: load?.pickup_location,
          delivery_location: load?.delivery_location,
          pickup_date: load?.pickup_date,
          delivery_date: load?.delivery_date,
          weight: load?.weight,
          distance: load?.distance,
          equipment_type: load?.equipment_type || load?.equipment,
          load_type: load?.load_type,
          description: load?.description,
          expedited: load?.expedited,
          hazmat: load?.hazmat,
          team_driver: load?.team_driver,
        })
      })
    }

    // Sort by date (most recent first)
    bookedLoads.sort((a, b) => 
      new Date(b.accepted_at).getTime() - new Date(a.accepted_at).getTime()
    )
    console.log(`✅ Returning ${bookedLoads.length} total booked loads`)
    
    return NextResponse.json(bookedLoads)
  } catch (error) {
    console.error('❌ Error in booked-loads API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booked loads' },
      { status: 500 }
    )
  }
}