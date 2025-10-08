import { NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function GET() {
  const loads = memoryStore.getAvailableLoads()
  return NextResponse.json(loads)
}