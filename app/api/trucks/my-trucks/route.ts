import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // In production, get carrierId from authenticated user
    // For now, we'll get all trucks (you can filter by carrier_id later)
    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching trucks:', error)
    return NextResponse.json([], { status: 200 })
  }
}