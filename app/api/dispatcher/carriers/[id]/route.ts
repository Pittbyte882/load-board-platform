import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

// PUT - Update a carrier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from cookies/session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse session to get user ID
    const session = JSON.parse(sessionCookie.value)
    const dispatcherId = session.id

    if (!dispatcherId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const carrierId = params.id
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'carrier_name',
      'company_name',
      'home_city',
      'home_state',
      'mc_number',
      'dot_number',
      'company_phone',
      'cell_phone',
      'equipment_type'
    ]

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `${field.replace('_', ' ')} is required` },
          { status: 400 }
        )
      }
    }

    // Verify carrier belongs to this dispatcher
    const { data: existingCarrier, error: checkError } = await supabase
      .from('carriers')
      .select('dispatcher_id')
      .eq('id', carrierId)
      .single()

    if (checkError || !existingCarrier) {
      return NextResponse.json({ error: 'Carrier not found' }, { status: 404 })
    }

    if (existingCarrier.dispatcher_id !== dispatcherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update carrier
    const { data: carrier, error } = await supabase
      .from('carriers')
      .update({
        carrier_name: body.carrier_name.trim(),
        company_name: body.company_name.trim(),
        home_city: body.home_city.trim(),
        home_state: body.home_state.trim().toUpperCase(),
        mc_number: body.mc_number.trim(),
        dot_number: body.dot_number.trim(),
        company_phone: body.company_phone.trim(),
        cell_phone: body.cell_phone.trim(),
        equipment_type: body.equipment_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', carrierId)
      .eq('dispatcher_id', dispatcherId)
      .select()
      .single()

    if (error) {
      console.error('Error updating carrier:', error)
      throw error
    }

    return NextResponse.json(carrier)
  } catch (error) {
    console.error('Error in carrier PUT:', error)
    return NextResponse.json(
      { error: 'Failed to update carrier' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a carrier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from cookies/session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse session to get user ID
    const session = JSON.parse(sessionCookie.value)
    const dispatcherId = session.id

    if (!dispatcherId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const carrierId = params.id

    // Verify carrier belongs to this dispatcher before deleting
    const { data: existingCarrier, error: checkError } = await supabase
      .from('carriers')
      .select('dispatcher_id')
      .eq('id', carrierId)
      .single()

    if (checkError || !existingCarrier) {
      return NextResponse.json({ error: 'Carrier not found' }, { status: 404 })
    }

    if (existingCarrier.dispatcher_id !== dispatcherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete carrier
    const { error } = await supabase
      .from('carriers')
      .delete()
      .eq('id', carrierId)
      .eq('dispatcher_id', dispatcherId)

    if (error) {
      console.error('Error deleting carrier:', error)
      throw error
    }

    return NextResponse.json({ success: true, message: 'Carrier deleted successfully' })
  } catch (error) {
    console.error('Error in carrier DELETE:', error)
    return NextResponse.json(
      { error: 'Failed to delete carrier' },
      { status: 500 }
    )
  }
}