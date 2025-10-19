import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brokerId = searchParams.get('brokerId')
    
    if (!brokerId) {
      return NextResponse.json({ error: 'Broker ID required' }, { status: 400 })
    }

    // Get all loads for this broker
    const { data: allLoads, error: loadsError } = await supabase
      .from('loads')
      .select('*')
      .eq('broker_id', brokerId)

    if (loadsError) throw loadsError

    // Calculate stats
    const activeLoads = allLoads?.filter(load => 
      load.status === 'available' || load.status === 'booked' || load.status === 'in-transit'
    ).length || 0

    const completedLoads = allLoads?.filter(load => 
      load.status === 'delivered'
    ).length || 0

    const totalRevenue = allLoads
      ?.filter(load => load.status === 'delivered')
      .reduce((sum, load) => sum + (load.rate || 0), 0) || 0

    const totalDistance = allLoads
      ?.filter(load => load.status === 'delivered' && load.distance > 0)
      .reduce((sum, load) => sum + load.distance, 0) || 0

    const averageRate = totalDistance > 0 
      ? totalRevenue / totalDistance 
      : 0

    // Get recent loads
    const recentLoads = allLoads
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(load => ({
        id: load.id,
        origin: load.pickup_location,
        destination: load.delivery_location,
        pickupDate: load.pickup_date,
        rate: load.rate,
        distance: load.distance,
        equipmentType: load.equipment_type,
        status: load.status
      })) || []

    return NextResponse.json({
      stats: {
        totalRevenue,
        activeLoads,
        completedLoads,
        averageRate
      },
      recentLoads
    })
  } catch (error) {
    console.error('Error fetching broker dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}