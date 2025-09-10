import { NextResponse } from 'next/server'
import { getAvailableLoads } from '@/lib/loads-store'

export async function GET() {
  try {
    console.log('GET /api/loads/available - fetching available loads')
    
    const availableLoads = getAvailableLoads()
    
    console.log(`Found ${availableLoads.length} available loads`)
    
    return NextResponse.json(availableLoads)
  } catch (error) {
    console.error('Error fetching available loads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available loads' },
      { status: 500 }
    )
  }
}
