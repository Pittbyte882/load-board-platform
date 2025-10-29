import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type UserRouteContext = { params: Promise<{ id: string }> }

// PATCH - Toggle user active status
export async function PATCH(
  request: NextRequest,
  { params }: UserRouteContext
) {
  try {
    const { id } = await params
    const { isActive } = await request.json()

    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    console.log('✅ User status updated:', id)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: UserRouteContext
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    console.log('✅ User deleted:', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}