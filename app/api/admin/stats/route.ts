import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) throw usersError

    // Get total loads count
    const { count: totalLoads, error: loadsError } = await supabase
      .from('loads')
      .select('*', { count: 'exact', head: true })

    if (loadsError) throw loadsError

    // Get active loads count (available or in-transit)
    const { count: activeLoads, error: activeLoadsError } = await supabase
      .from('loads')
      .select('*', { count: 'exact', head: true })
      .in('status', ['available', 'in-transit'])

    if (activeLoadsError) throw activeLoadsError

    // Get brokers count
    const { count: brokers, error: brokersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'broker')

    if (brokersError) throw brokersError

    // Get carriers count
    const { count: carriers, error: carriersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'carrier')

    if (carriersError) throw carriersError

    // Get dispatchers count
    const { count: dispatchers, error: dispatchersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'dispatcher')

    if (dispatchersError) throw dispatchersError

    // Calculate total revenue from accepted loads
    const { data: acceptedLoads, error: revenueError } = await supabase
      .from('load_acceptances')
      .select('accepted_rate')
      .eq('approval_status', 'approved')

    if (revenueError) throw revenueError

    const totalRevenue = acceptedLoads?.reduce((sum, load) => {
      return sum + (parseFloat(load.accepted_rate) || 0)
    }, 0) || 0

    const stats = {
      totalUsers: totalUsers || 0,
      totalLoads: totalLoads || 0,
      totalRevenue: Math.round(totalRevenue),
      activeLoads: activeLoads || 0,
      brokers: brokers || 0,
      carriers: carriers || 0,
      dispatchers: dispatchers || 0,
    }

    console.log('✅ Admin stats fetched:', stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
