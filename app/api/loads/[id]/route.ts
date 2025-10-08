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
    const updates = await request.json()
    
    const { data, error } = await supabase
      .from('loads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    if (!data) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      load: data,
      message: 'Load updated successfully'
    })
  } catch (error) {
    console.error('Error updating load:', error)
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