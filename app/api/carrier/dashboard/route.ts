import { NextResponse } from 'next/server'

export async function GET() {
  // In production, connect to your database and fetch real user data
  // For now, return empty structure for new users
  
  return NextResponse.json({
    stats: {
      totalEarnings: 0,
      completedLoads: 0,
      averageRate: 0,
      rating: 0,
    },
    upcomingLoads: [],
    recentActivity: []
  })
}