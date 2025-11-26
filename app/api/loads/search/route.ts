import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      origin,
      deadheadRadius,
      destination,
      deliveryRadius,
      equipmentType,
      loadType,
      weightMin,
      weightMax,
      dateFrom,
      dateTo,
      sortBy
    } = body

    console.log('🔍 Search request:', body)

    // Start with base query for available loads
    let query = supabase
      .from('loads')
      .select('*')
      .eq('status', 'available')

    // Equipment filter
    if (equipmentType && equipmentType !== 'all') {
      query = query.eq('equipment_type', equipmentType)
    }

    // Load type filter
    if (loadType && loadType !== 'all') {
      query = query.eq('load_type', loadType)
    }

    // Weight range filter
    if (weightMin) {
      query = query.gte('weight', parseInt(weightMin))
    }
    if (weightMax) {
      query = query.lte('weight', parseInt(weightMax))
    }

    // Date range filter
    if (dateFrom) {
      query = query.gte('pickup_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('pickup_date', dateTo)
    }

    // Location filters (simplified - contains match)
    // In production, you'd use PostGIS or geocoding for radius search
    if (origin) {
      query = query.ilike('pickup_location', `%${origin}%`)
    }
    if (destination) {
      query = query.ilike('delivery_location', `%${destination}%`)
    }

    // Execute query
    const { data: loads, error } = await query

    if (error) {
      console.error('❌ Search error:', error)
      throw error
    }

    console.log(`✅ Found ${loads?.length || 0} loads`)

    // Transform database fields to match frontend
    const transformedLoads = (loads || []).map((load: any) => ({
      id: load.id,
      brokerId: load.broker_id,
      brokerName: load.broker_name,
      brokerCompany: load.broker_company,
      brokerMC: load.broker_mc_number || load.broker_mc || 'N/A',
      origin: load.origin,
      destination: load.destination,
      pickupLocation: load.pickup_location || load.origin,
      deliveryLocation: load.delivery_location || load.destination,
      pickupDate: load.pickup_date,
      deliveryDate: load.delivery_date,
      weight: load.weight,
      rate: load.rate,
      distance: load.distance,
      equipment: load.equipment_type || load.equipment,
      equipmentType: load.equipment_type || load.equipment,
      loadType: load.load_type,
      description: load.description,
      status: load.status,
      expedited: load.expedited || false,
      hazmat: load.hazmat || false,
      teamDriver: load.team_driver || false,
      createdAt: load.created_at || load.posted_date,
      postedDate: load.posted_date || load.created_at
    }))

    // Sort results
    transformedLoads.sort((a, b) => {
      switch (sortBy) {
        case 'rate':
          return b.rate - a.rate
        case 'ratePerMile':
          const aRpm = a.distance ? a.rate / a.distance : 0
          const bRpm = b.distance ? b.rate / b.distance : 0
          return bRpm - aRpm
        case 'pickupDate':
          return new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime()
        case 'distance':
          return (a.distance || 0) - (b.distance || 0)
        default: // postedDate
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return NextResponse.json({ 
      loads: transformedLoads,
      count: transformedLoads.length
    })
  } catch (error) {
    console.error('❌ Error in search API:', error)
    return NextResponse.json(
      { error: 'Failed to search loads' },
      { status: 500 }
    )
  }
}