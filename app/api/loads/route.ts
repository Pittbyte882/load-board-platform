import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'available'
    const limit = parseInt(searchParams.get('limit') || '100')

    console.log('📦 Fetching loads with status:', status)

    const { data: loads, error } = await supabase
      .from('loads')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    console.log(`✅ Found ${loads?.length || 0} loads`)

    return NextResponse.json({ loads: loads || [] })
  } catch (error) {
    console.error('❌ Error fetching loads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📦 Creating new LOAD (not negotiation):', body)

    // Generate unique load ID
    const loadId = `LOAD-${Date.now()}`
    
    const loadData = {
      id: loadId,
      broker_id: body.brokerId,
      broker_name: body.brokerName,
      broker_company: body.brokerCompany,
      broker_mc_number: body.brokerMcNumber,
      broker_mc: body.brokerMcNumber,
      origin: body.origin,
      destination: body.destination,
      pickup_location: body.origin,
      delivery_location: body.destination,
      pickup_date: body.pickupDate,
      delivery_date: body.deliveryDate,
      weight: parseInt(body.weight),
      rate: parseInt(body.rate),
      distance: parseInt(body.distance),
      equipment: body.equipment,
      equipment_type: body.equipment,
      load_type: body.loadType,
      description: body.description,
      status: 'available',
      expedited: body.expedited || false,
      hazmat: body.hazmat || false,
      team_driver: body.teamDriver || false,
      special_requirements: body.specialRequirements || null,
      stops: body.stops || null,
      posted_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('💾 Inserting load data:', loadData)
    
    const { data, error } = await supabase
      .from('loads')
      .insert([loadData])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }
    
    console.log('✅ Load created successfully:', data.id)
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating load:', error)
    return NextResponse.json(
      { error: 'Failed to create load', details: error },
      { status: 500 }
    )
  }
}
