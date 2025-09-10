import { NextResponse } from 'next/server'
import { truckStore } from '@/lib/truck-store'

export async function GET() {
  try {
    // In a real app, you'd get the carrier ID from the authenticated user
    const carrierId = 'carrier-123'
    const userTrucks = truckStore.getTrucksByCarrierId(carrierId)
    console.log('GET /api/trucks/my-trucks - returning trucks:', userTrucks.length)
    
    return NextResponse.json(userTrucks)
  } catch (error) {
    console.error('Error fetching user trucks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trucks' },
      { status: 500 }
    )
  }
}
