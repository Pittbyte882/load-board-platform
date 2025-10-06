import { NextResponse } from 'next/server'

export async function GET() {
  // In production, fetch broker's dashboard data from database
  // For now, return empty stats for new users
  
  return NextResponse.json({
    stats: {
      totalRevenue: 0,
      activeLoads: 0,
      completedLoads: 0,
      averageRate: 0,
    },
    recentLoads: []
  })
}