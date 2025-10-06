import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') || ''

  try {
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

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') || ''

  return NextResponse.json({ success: true, id })
}
