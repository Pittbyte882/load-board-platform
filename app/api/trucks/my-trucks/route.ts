import { NextResponse } from 'next/server'

export async function GET() {
  // In production, fetch user's trucks from database
  // For now, return empty array for new users
  
  return NextResponse.json([])
}