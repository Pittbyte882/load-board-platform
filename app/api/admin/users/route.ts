import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Fetch all users from database
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, company_name, role, phone, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format users for admin display
    const formattedUsers = users?.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      companyName: user.company_name,
      role: user.role,
      phone: user.phone,
      isActive: user.is_active,
      joinDate: new Date(user.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      lastActive: getLastActive(user.updated_at), 
      status: user.is_active ? 'active' : 'inactive',
    })) || []

    console.log(`✅ Fetched ${formattedUsers.length} users for admin`)

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("❌ Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// Helper function to calculate last active time
function getLastActive(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}