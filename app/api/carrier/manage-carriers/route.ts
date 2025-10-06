import { NextResponse } from 'next/server'

export async function GET() {
  // In production, connect to your database and fetch carriers
  // For now, return empty array for new users
  
  return NextResponse.json({
    carriers: []
  })
}

export async function POST(request: Request) {
  // In production, save to database
  // For now, return the carrier data with a generated ID
  
  try {
    const body = await request.json()
    
    const newCarrier = {
      id: Date.now().toString(),
      ...body,
      rating: 0,
      completedLoads: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
    }
    
    return NextResponse.json(newCarrier, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create carrier' },
      { status: 500 }
    )
  }
}