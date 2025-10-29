import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Fetch all loads from database
    const { data: loads, error } = await supabase
      .from('loads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format loads for admin display
    const formattedLoads = loads?.map((load) => ({
      id: load.id,
      origin: load.origin,
      destination: load.destination,
      pickupLocation: load.pickup_location,
      deliveryLocation: load.delivery_location,
      pickupDate: load.pickup_date,
      deliveryDate: load.delivery_date,
      distance: load.distance,
      weight: load.weight,
      rate: load.rate,
      status: load.status,
      broker: load.broker_company || load.broker_name,
      brokerName: load.broker_name,
      brokerCompany: load.broker_company,
      brokerId: load.broker_id,
      postedDate: new Date(load.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }),
      equipmentType: load.equipment_type,
      loadType: load.load_type,
      description: load.description,
      expedited: load.expedited,
      hazmat: load.hazmat,
      teamDriver: load.team_driver,
    })) || []

    console.log(`✅ Fetched ${formattedLoads.length} loads for admin`)

    return NextResponse.json(formattedLoads)
  } catch (error) {
    console.error("❌ Error fetching loads:", error)
    return NextResponse.json({ error: "Failed to fetch loads" }, { status: 500 })
  }
}