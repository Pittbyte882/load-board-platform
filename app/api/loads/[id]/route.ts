import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type LoadRouteContext = { params: Promise<{ id: string }> }

export async function GET(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params
    
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    if (!data) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching load:', error)
    return NextResponse.json({ error: 'Failed to fetch load' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params
    const updatedLoad = await request.json()

    console.log('🔄 Updating load:', id)
    console.log('📝 Raw deliveryDate from request:', updatedLoad.deliveryDate)
    console.log('📝 All request keys:', Object.keys(updatedLoad))

    // Map frontend camelCase to database snake_case
    const updateData = {
      pickup_location: updatedLoad.origin,
      delivery_location: updatedLoad.destination,
      pickup_date: updatedLoad.pickupDate,
      delivery_date: updatedLoad.deliveryDate,  // ← This fixes the issue!
      rate: updatedLoad.rate,
      weight: updatedLoad.weight,
      description: updatedLoad.description,
      equipment_type: updatedLoad.equipment,
      expedited: updatedLoad.expedited || false,
      hazmat: updatedLoad.hazmat || false,
      
    }

    console.log('📤 Update payload to Supabase:', updateData)

    const { data, error } = await supabase
      .from('loads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error details:', error)
      throw error
    }

    console.log('✅ Load updated successfully')
    return NextResponse.json({ success: true, load: data })
  } catch (error) {
    console.error('❌ Full error object:', error)
    return NextResponse.json({ error: 'Failed to update load' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params
    
    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Load deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting load:', error)
    return NextResponse.json({ error: 'Failed to delete load' }, { status: 500 })
  }
}