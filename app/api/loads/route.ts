import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brokerId = searchParams.get('brokerId')
    
    let query = supabase.from('loads').select('*')
    
    if (brokerId) {
      query = query.eq('broker_id', brokerId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching loads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const loadData = {
      id: `LOAD-${Date.now()}`,
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
    }
    
    const { data, error } = await supabase
      .from('loads')
      .insert([loadData])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating load:', error)
    return NextResponse.json(
      { error: 'Failed to create load' },
      { status: 500 }
    )
  }
}