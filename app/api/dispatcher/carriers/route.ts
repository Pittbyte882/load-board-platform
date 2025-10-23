import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

// GET - Fetch all carriers for the logged-in dispatcher
export async function GET(request: NextRequest) {
  try {
    // Get user from cookies/session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse session to get user ID
    const session = JSON.parse(sessionCookie.value)
    const dispatcherId = session.id

    if (!dispatcherId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    // Fetch all carriers for this dispatcher
    const { data: carriers, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('dispatcher_id', dispatcherId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching carriers:', error)
      throw error
    }

    return NextResponse.json(carriers || [])
  } catch (error) {
    console.error('Error in carriers GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch carriers' },
      { status: 500 }
    )
  }
}

// POST - Create a new carrier
export async function POST(request: NextRequest) {
  try {
    // Get user from cookies/session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse session to get user ID
    const session = JSON.parse(sessionCookie.value)
    const dispatcherId = session.id

    if (!dispatcherId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'carrier_name',
      'company_name',
      'home_city',
      'home_state',
      'mc_number',
      'dot_number',
      'company_phone',
      'cell_phone',
      'equipment_type'
    ]

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `${field.replace('_', ' ')} is required` },
          { status: 400 }
        )
      }
    }

    // Insert new carrier
    const { data: carrier, error } = await supabase
      .from('carriers')
      .insert({
        dispatcher_id: dispatcherId,
        carrier_name: body.carrier_name.trim(),
        company_name: body.company_name.trim(),
        home_city: body.home_city.trim(),
        home_state: body.home_state.trim().toUpperCase(),
        mc_number: body.mc_number.trim(),
        dot_number: body.dot_number.trim(),
        company_phone: body.company_phone.trim(),
        cell_phone: body.cell_phone.trim(),
        equipment_type: body.equipment_type,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating carrier:', error)
      throw error
    }

    return NextResponse.json(carrier, { status: 201 })
  } catch (error) {
    console.error('Error in carriers POST:', error)
    return NextResponse.json(
      { error: 'Failed to create carrier' },
      { status: 500 }
    )
  }
}