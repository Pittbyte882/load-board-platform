import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type CarrierRouteContext = { params: Promise<{ id: string }> }

export async function PUT(
  request: NextRequest,
  { params }: CarrierRouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updateData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      equipment_type: body.equipmentType,
      location: body.location,
      mc_number: body.mcNumber,
      dot_number: body.dotNumber,
      last_active: new Date().toISOString(),
    }
    
    const { data, error } = await supabase
      .from('carriers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating carrier:', error)
    return NextResponse.json(
      { error: 'Failed to update carrier' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: CarrierRouteContext
) {
  try {
    const { id } = await params
    
    const { error } = await supabase
      .from('carriers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting carrier:', error)
    return NextResponse.json(
      { error: 'Failed to delete carrier' },
      { status: 500 }
    )
  }
}