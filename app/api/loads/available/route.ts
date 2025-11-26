import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
   // Map snake_case to camelCase for frontend
    const mappedLoads = (data || []).map((load: any) => ({
      id: load.id,
      brokerId: load.broker_id,
      brokerName: load.broker_name,
      brokerCompany: load.broker_company,
      brokerMC: load.broker_mc,
      brokerMcNumber: load.broker_mc_number,
      pickupLocation: load.pickup_location,
      deliveryLocation: load.delivery_location,
      pickupDate: load.pickup_date,
      deliveryDate: load.delivery_date,
      weight: load.weight,
      rate: load.rate,
      distance: load.distance,
      equipmentType: load.equipment_type,
      loadType: load.load_type,
      description: load.description,
      status: load.status,
      expedited: load.expedited,
      hazmat: load.hazmat,
      teamDriver: load.team_driver,
      specialRequirements: load.special_requirements,
      stops: load.stops,
      createdAt: load.created_at,
      // Add any other fields you need
    }))
    
    return NextResponse.json(mappedLoads)
  } catch (error) {
    console.error('Error fetching available loads:', error)
    return NextResponse.json([], { status: 200 })
  }
}