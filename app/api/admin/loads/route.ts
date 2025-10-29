import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log('🔍 Fetching loads for admin...')
    
    // Fetch all loads from database
    const { data: loads, error } = await supabase
      .from('loads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    console.log(`📦 Found ${loads?.length || 0} loads in database`)

    if (!loads || loads.length === 0) {
      console.log('⚠️ No loads in database')
      return NextResponse.json([])
    }

    // Log first load to see structure
    console.log('📋 Sample load structure:', loads[0])

    // Format loads for admin display - matching your exact table structure
    const formattedLoads = loads.map((load) => ({
      id: load.id,
      origin: load.origin,
      destination: load.destination,
      pickupLocation: load.pickup_location,
      deliveryLocation: load.delivery_location,
      pickupDate: load.pickup_date,
      deliveryDate: load.delivery_date,
      distance: load.distance || 0,
      weight: load.weight || 0,
      rate: load.rate || 0,
      status: load.status || 'available',
      broker: load.broker_company || load.broker_name || 'Unknown',
      brokerName: load.broker_name,
      brokerCompany: load.broker_company,
      brokerId: load.broker_id,
      postedDate: load.created_at ? new Date(load.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }) : 'N/A',
      equipmentType: load.equipment_type || 'N/A',
      loadType: load.load_type || 'N/A',
      description: load.description || '',
      expedited: load.expedited || false,
      hazmat: load.hazmat || false,
      teamDriver: load.team_driver || false,
    }))

    console.log(`✅ Returning ${formattedLoads.length} formatted loads to admin`)

    return NextResponse.json(formattedLoads)
  } catch (error) {
    console.error("❌ Error in admin loads API:", error)
    return NextResponse.json({ 
      error: "Failed to fetch loads",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
