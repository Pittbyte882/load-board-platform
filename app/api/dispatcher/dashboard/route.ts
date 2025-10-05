// app/api/dispatcher/dashboard/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    stats: {
      totalCarriers: 0,
      activeLoads: 0,
      totalRevenue: 0,
      avgLoadValue: 0,
      rating: 0,
    },
    upcomingLoads: [],
    recentActivity: []
  })
}

