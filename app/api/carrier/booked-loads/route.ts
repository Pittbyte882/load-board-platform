import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get current user from cookies
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.id

    console.log('🚛 Fetching booked loads for user:', userId)

    // Get bookings where this user is the carrier
    const { data: bookings, error: bookingsError } = await supabase
      .from('load_bookings')
      .select('*')
      .eq('carrier_id', userId)
      .order('booked_at', { ascending: false })

    if (bookingsError) throw bookingsError

    if (!bookings || bookings.length === 0) {
      console.log('📦 No bookings found for user:', userId)
      return NextResponse.json({ loads: [] })
    }

    console.log(`✅ Found ${bookings.length} bookings`)

    // Get the load details for each booking
    const loadIds = bookings.map(b => b.load_id)
    
    const { data: loads, error: loadsError } = await supabase
      .from('loads')
      .select('*')
      .in('id', loadIds)

    if (loadsError) throw loadsError

    // Merge booking data with load data
    const bookedLoads = bookings.map(booking => {
      const load = loads?.find(l => l.id === booking.load_id)
      return {
        bookingId: booking.id,
        ...load,
        bookedRate: booking.booked_rate,
        bookedAt: booking.booked_at,
        bookingStatus: booking.status,
        brokerName: booking.broker_name,
        brokerCompany: booking.broker_company,
        carrierName: booking.carrier_name,
        carrierCompany: booking.carrier_company
      }
    })

    console.log(`✅ Returning ${bookedLoads.length} booked loads`)

    return NextResponse.json({ loads: bookedLoads })
  } catch (error) {
    console.error('❌ Error fetching booked loads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booked loads' },
      { status: 500 }
    )
  }
}