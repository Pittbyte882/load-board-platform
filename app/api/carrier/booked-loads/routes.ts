import { NextResponse } from 'next/server'

export async function GET() {
  // In production, fetch from database based on logged-in carrier
  // For now, return empty array for new users
  
  return NextResponse.json({
    loads: []  // Empty array - no demo data
  })
}