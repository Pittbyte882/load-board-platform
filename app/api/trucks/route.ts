import { NextRequest, NextResponse } from 'next/server'
import { truckStore } from '@/lib/truck-store'

export async function GET() {
  try {
    const trucks = truckStore.getAllTrucks()
    console.log('GET /api/trucks - returning trucks:', trucks.length)
    return NextResponse.json(trucks)
  } catch (error) {
    console.error('Error fetching trucks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trucks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const truckData = await request.json()
    console.log('POST /api/trucks - received data:', truckData)
    
    // Validate required fields
    if (!truckData.truckType || !truckData.availableDate || !truckData.city || !truckData.state) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const newTruck = truckStore.addTruck(truckData)
    console.log('POST /api/trucks - created truck:', newTruck)
    
    return NextResponse.json(newTruck, { status: 201 })
  } catch (error) {
    console.error('Error creating truck:', error)
    return NextResponse.json(
      { error: 'Failed to create truck posting' },
      { status: 500 }
    )
  }
}
