import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .eq('status', 'available')
      .gte('available_date', new Date().toISOString().split('T')[0]) // Only future/today dates
      .order('posted_date', { ascending: false })
    
    if (error) throw error

    console.log(`✅ Fetched ${data?.length || 0} available trucks`)
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching available trucks:', error)
    return NextResponse.json([], { status: 200 })
  }
}