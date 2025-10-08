import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const truckData = {
      id: `TRUCK-${Date.now()}`,
      carrier_id: body.carrierId,
      carrier_name: body.carrierName,
      carrier_company: body.carrierCompany,
      equipment_type: body.equipmentType,
      available_date: body.availableDate,
      city: body.city,
      state: body.state,
      capacity: body.capacity ? parseInt(body.capacity) : null,
      dot_number: body.dotNumber || null,
      mc_number: body.mcNumber || null,
      special_equipment: body.specialEquipment || null,
      description: body.description || null,
      status: 'available',
      posted_date: new Date().toISOString(),
    }
    
    const { data, error } = await supabase
      .from('trucks')
      .insert([truckData])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating truck:', error)
    return NextResponse.json(
      { error: 'Failed to create truck' },
      { status: 500 }
    )
  }
}