import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ carriers: data || [] })
  } catch (error) {
    console.error('Error fetching carriers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch carriers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const carrierData = {
      id: `CARRIER-${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      equipment_type: body.equipmentType,
      location: body.location,
      mc_number: body.mcNumber,
      dot_number: body.dotNumber,
      rating: 0,
      completed_loads: 0,
      status: 'active',
      joined_date: new Date().toISOString().split('T')[0],
      last_active: new Date().toISOString(),
    }
    
    const { data, error } = await supabase
      .from('carriers')
      .insert([carrierData])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating carrier:', error)
    return NextResponse.json(
      { error: 'Failed to create carrier' },
      { status: 500 }
    )
  }
}