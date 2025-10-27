import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get user from session cookie - CHANGED FROM 'session' TO 'user-session'
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user-session')
    
    console.log('🔍 Session cookie:', sessionCookie ? 'Found' : 'Not found')
    
    if (!sessionCookie) {
      console.error('❌ No session cookie found')
      return NextResponse.json({ error: 'Unauthorized - Please log in again' }, { status: 401 })
    }

    let session
    try {
      session = JSON.parse(sessionCookie.value)
      console.log('✅ Session parsed:', session)
    } catch (parseError) {
      console.error('❌ Error parsing session:', parseError)
      return NextResponse.json({ error: 'Invalid session format' }, { status: 401 })
    }

    const userId = session.id

    console.log('🔍 User ID from session:', userId)

    if (!userId) {
      console.error('❌ No user ID in session')
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Request body:', body)

    // Validate required fields
    const requiredFields = [
      'carrierName',
      'carrierCompany',
      'equipmentType',
      'availableDate',
      'city',
      'state'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Insert truck
    const truckData = {
      carrier_id: userId,
      carrier_name: body.carrierName,
      carrier_company: body.carrierCompany,
      equipment_type: body.equipmentType,
      available_date: body.availableDate,
      city: body.city,
      state: body.state,
      capacity: body.capacity ? parseInt(body.capacity) : null,
      dot_number: body.dotNumber || null,
      mc_number: body.mcNumber || null,
      special_equipment: body.specialEquipment || [],
      description: body.description || null,
      phone: body.phone || null,
      status: 'available',
      posted_date: new Date().toISOString()
    }

    console.log('💾 Attempting to insert truck:', truckData)

    const { data: truck, error } = await supabase
      .from('trucks')
      .insert(truckData)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    console.log('✅ Truck posted successfully:', truck.id)

    return NextResponse.json(truck, { status: 201 })
  } catch (error) {
    console.error('❌ Error in trucks POST:', error)
    return NextResponse.json(
      { error: 'Failed to post truck', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}