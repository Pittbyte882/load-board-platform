import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type LoadRouteContext = { params: Promise<{ id: string }> }

// GET - Admin can view any load with full details
export async function GET(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params
    
    // Admin gets full load details with user info
    const { data, error } = await supabase
      .from('loads')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          email,
          company_name
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    if (!data) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching load for admin:', error)
    return NextResponse.json({ error: 'Failed to fetch load' }, { status: 500 })
  }
}

// PUT - Admin can update any load with additional fields
export async function PUT(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params
    const updatedLoad = await request.json()

    console.log('🔄 Admin updating load:', id)

    // Admin can update additional fields that regular users cannot
    const updateData = {
      pickup_location: updatedLoad.origin,
      delivery_location: updatedLoad.destination,
      pickup_date: updatedLoad.pickupDate,
      delivery_date: updatedLoad.deliveryDate,
      rate: updatedLoad.rate,
      weight: updatedLoad.weight,
      description: updatedLoad.description,
      equipment_type: updatedLoad.equipment,
      expedited: updatedLoad.expedited || false,
      hazmat: updatedLoad.hazmat || false,
      status: updatedLoad.status, // Admin can change status
      broker_id: updatedLoad.brokerId, // Admin can reassign loads
      carrier_id: updatedLoad.carrierId, // Admin can assign carriers
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('loads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Admin update error:', error)
      throw error
    }

    console.log('✅ Admin updated load successfully')
    return NextResponse.json({ success: true, load: data })
  } catch (error) {
    console.error('❌ Admin update failed:', error)
    return NextResponse.json({ error: 'Failed to update load' }, { status: 500 })
  }
}

// DELETE - Admin can delete any load
export async function DELETE(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params

    console.log('🗑️ Admin deleting load:', id)

    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Admin delete error:', error)
      throw error
    }

    console.log('✅ Admin deleted load successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Admin delete failed:', error)
    return NextResponse.json({ error: 'Failed to delete load' }, { status: 500 })
  }
}