import { NextResponse } from 'next/server'

export async function GET() {
  // In production, fetch available trucks from database
  // For now, return empty array for new users
  
  return NextResponse.json([])
}