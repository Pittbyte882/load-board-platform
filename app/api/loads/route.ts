import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brokerId = searchParams.get('brokerId')
    
    // In production, fetch loads from database based on brokerId
    // For now, return empty array for new users
    
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching loads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['brokerId', 'brokerName', 'brokerCompany', 'brokerMcNumber', 'origin', 'destination', 'pickupDate', 'deliveryDate', 'weight', 'rate', 'distance', 'equipment', 'loadType', 'description']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // In production, save to database
    // For now, return the load data with a generated ID
    
    const newLoad = {
      id: `LOAD-${Date.now()}`,
      ...body,
      weight: typeof body.weight === 'string' ? parseInt(body.weight) : body.weight,
      rate: typeof body.rate === 'string' ? parseInt(body.rate) : body.rate,
      distance: typeof body.distance === 'string' ? parseInt(body.distance) : body.distance,
      createdAt: new Date().toISOString(),
    }
    
    return NextResponse.json(newLoad, { status: 201 })
  } catch (error) {
    console.error('Error creating load:', error)
    return NextResponse.json(
      { error: 'Failed to create load' },
      { status: 500 }
    )
  }
}