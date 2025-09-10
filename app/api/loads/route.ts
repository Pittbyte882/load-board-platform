import { NextRequest, NextResponse } from 'next/server'
import { getAllLoads, getLoadsByBrokerId, addLoad } from '@/lib/loads-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brokerId = searchParams.get('brokerId')
    
    console.log('GET /api/loads - brokerId:', brokerId)
    
    let loads
    if (brokerId) {
      loads = getLoadsByBrokerId(brokerId)
      console.log(`Found ${loads.length} loads for broker ${brokerId}`)
    } else {
      loads = getAllLoads()
      console.log(`Found ${loads.length} total loads`)
    }
    
    return NextResponse.json(loads)
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
    console.log('POST /api/loads - received data:', body)
    
    // Validate required fields
    const requiredFields = ['brokerId', 'brokerName', 'brokerCompany', 'brokerMcNumber', 'origin', 'destination', 'pickupDate', 'deliveryDate', 'weight', 'rate', 'distance', 'equipment', 'loadType', 'description']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Ensure numeric fields are numbers
    const loadData = {
      ...body,
      weight: typeof body.weight === 'string' ? parseInt(body.weight) : body.weight,
      rate: typeof body.rate === 'string' ? parseInt(body.rate) : body.rate,
      distance: typeof body.distance === 'string' ? parseInt(body.distance) : body.distance,
    }

    console.log('Processed load data:', loadData)
    
    const newLoad = addLoad(loadData)
    console.log('Load created successfully:', newLoad.id)
    
    return NextResponse.json(newLoad, { status: 201 })
  } catch (error) {
    console.error('Error creating load:', error)
    return NextResponse.json(
      { error: 'Failed to create load' },
      { status: 500 }
    )
  }
}
