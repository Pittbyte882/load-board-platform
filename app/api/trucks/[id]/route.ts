import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // In production, delete truck from database
  
  return NextResponse.json({ success: true })
}
