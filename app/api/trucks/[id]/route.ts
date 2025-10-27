import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

type TruckRouteContext = { params: Promise<{ id: string }> }

export async function DELETE(
  request: NextRequest,
  { params }: TruckRouteContext
) {
  try {
    // Get user from session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const { id } = await params

    // Verify truck belongs to this user
    const { data: existingTruck, error: checkError } = await supabase
      .from('trucks')
      .select('carrier_id')
      .eq('id', id)
      .single()

    if (checkError || !existingTruck) {
      return NextResponse.json({ error: 'Truck not found' }, { status: 404 })
    }

    if (existingTruck.carrier_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete truck
    const { error } = await supabase
      .from('trucks')
      .delete()
      .eq('id', id)
      .eq('carrier_id', userId)
    
    if (error) {
      console.error('Error deleting truck:', error)
      throw error
    }

    console.log('✅ Truck deleted:', id)
    
    return NextResponse.json({ success: true, message: 'Truck deleted successfully' })
  } catch (error) {
    console.error('Error deleting truck:', error)
    return NextResponse.json(
      { error: 'Failed to delete truck' },
      { status: 500 }
    )
  }
}

// PUT - Update truck
export async function PUT(
  request: NextRequest,
  { params }: TruckRouteContext
) {
  try {
    // Get user from session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify truck belongs to this user
    const { data: existingTruck, error: checkError } = await supabase
      .from('trucks')
      .select('carrier_id')
      .eq('id', id)
      .single()

    if (checkError || !existingTruck) {
      return NextResponse.json({ error: 'Truck not found' }, { status: 404 })
    }

    if (existingTruck.carrier_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update truck
    const { data: truck, error } = await supabase
      .from('trucks')
      .update({
        equipment_type: body.equipmentType,
        available_date: body.availableDate,
        city: body.city,
        state: body.state,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        dot_number: body.dotNumber,
        mc_number: body.mcNumber,
        special_equipment: body.specialEquipment,
        description: body.description,
        phone: body.phone,
        status: body.status
      })
      .eq('id', id)
      .eq('carrier_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating truck:', error)
      throw error
    }

    console.log('✅ Truck updated:', id)

    return NextResponse.json(truck)
  } catch (error) {
    console.error('Error in truck PUT:', error)
    return NextResponse.json(
      { error: 'Failed to update truck' },
      { status: 500 }
    )
  }
}