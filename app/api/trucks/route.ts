import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['carrierId', 'carrierName', 'carrierCompany', 'equipmentType', 'availableDate', 'city', 'state']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // In production, save to database
    // For now, return the truck data with generated ID and timestamp
    
    const newTruck = {
      id: `TRUCK-${Date.now()}`,
      ...body,
      postedDate: new Date().toISOString(),
      status: body.status || 'available'
    }
    
    return NextResponse.json(newTruck, { status: 201 })
  } catch (error) {
    console.error('Error creating truck:', error)
    return NextResponse.json(
      { error: 'Failed to create truck' },
      { status: 500 }
    )
  }
}