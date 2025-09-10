import { NextRequest, NextResponse } from 'next/server'
import { claimLoad } from '@/lib/loads-store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { carrierId, carrierName } = await request.json()
    const { id } = await params
    
    console.log(`POST /api/loads/${id}/claim - carrierId: ${carrierId}, carrierName: ${carrierName}`)
    
    if (!carrierId || !carrierName) {
      return NextResponse.json(
        { error: 'carrierId and carrierName are required' },
        { status: 400 }
      )
    }
    
    const claimedLoad = claimLoad(id, carrierId, carrierName)
    
    if (!claimedLoad) {
      return NextResponse.json(
        { error: 'Load not found or not available' },
        { status: 404 }
      )
    }
    
    console.log(`Load ${id} successfully claimed by ${carrierName}`)
    
    return NextResponse.json({
      success: true,
      load: claimedLoad,
      message: `Load ${id} claimed successfully`
    })
  } catch (error) {
    console.error('Error claiming load:', error)
    return NextResponse.json(
      { error: 'Failed to claim load' },
      { status: 500 }
    )
  }
}
