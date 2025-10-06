import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updatedCarrier = {
      id,
      ...body,
    }

    return NextResponse.json(updatedCarrier)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update carrier' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // In production, delete from database
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete carrier' },
      { status: 500 }
    )
  }
}