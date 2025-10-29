import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type LoadRouteContext = { params: Promise<{ id: string }> }

// DELETE - Delete load
export async function DELETE(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params

    console.log('🗑️ Deleting load:', id)

    // Delete the load from the database
    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error deleting load:', error)
      throw error
    }

    console.log('✅ Load deleted successfully:', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error in delete load API:', error)
    return NextResponse.json(
      { error: 'Failed to delete load' },
      { status: 500 }
    )
  }
}