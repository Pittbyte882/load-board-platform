import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type TruckRouteContext = { params: Promise<{ id: string }> }

export async function DELETE(
  request: NextRequest,
  { params }: TruckRouteContext
) {
  try {
    const { id } = await params
    
    const { error } = await supabase
      .from('trucks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting truck:', error)
    return NextResponse.json(
      { error: 'Failed to delete truck' },
      { status: 500 }
    )
  }
}