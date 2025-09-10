import { NextResponse } from 'next/server'
import { truckStore } from '@/lib/truck-store'

export async function GET() {
  try {
    const availableTrucks = truckStore.getAvailableTrucks()
    console.log('GET /api/trucks/available - returning trucks:', availableTrucks.length)
    
    return NextResponse.json(availableTrucks)
  } catch (error) {
    console.error('Error fetching available trucks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available trucks' },
      { status: 500 }
    )
  }
}
