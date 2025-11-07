import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    // Verify this is called by a cron job (optional security)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Checking for trial ending reminders...')

    const now = new Date()
    
    // Get all subscriptions that are trialing
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        users!inner(id, email, first_name, last_name, role)
      `)
      .eq('status', 'trialing')
      .not('trial_end', 'is', null)

    if (error) throw error

    let remindersSent = 0

    for (const subscription of subscriptions || []) {
      const trialEnd = new Date(subscription.trial_end)
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Get pricing info
      const { data: pricingPlan } = await supabase
        .from('pricing_plans')
        .select('name, monthly_price')
        .eq('user_type', subscription.users.role)
        .single()

      // Check if we should send reminder (3 days or 7 days before)
      const shouldSend3Day = daysRemaining === 3
      const shouldSend7Day = daysRemaining === 7

      if (!shouldSend3Day && !shouldSend7Day) {
        continue
      }

      // Check if reminder already sent for this day
      const reminderKey = `trial_reminder_${subscription.id}_${daysRemaining}d`
      const { data: existingReminder } = await supabase
        .from('email_logs')
        .select('id')
        .eq('reminder_key', reminderKey)
        .single()

      if (existingReminder) {
        console.log(`⏭️  Reminder already sent for subscription ${subscription.id}`)
        continue
      }

      // Get user stats (optional - you can skip this if you don't have stats)
      const stats = {
        loadsSearched: 0,
        bookingsMade: 0,
        timeSaved: 'hours',
      }

      // Send reminder email
      const chargeDate = new Date(trialEnd)
      chargeDate.setDate(chargeDate.getDate() + 1)

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'trial-ending',
          to: subscription.users.email,
          data: {
            userName: `${subscription.users.first_name} ${subscription.users.last_name}`,
            planName: pricingPlan?.name || 'Plan',
            trialDays: daysRemaining + Math.abs(daysRemaining - (subscription.users.role === 'broker' ? 120 : 7)),
            daysRemaining: daysRemaining,
            amount: pricingPlan?.monthly_price || 99,
            chargeDate: chargeDate.toLocaleDateString(),
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            stats: stats,
          },
        }),
      })

      // Log that we sent this reminder
      await supabase
        .from('email_logs')
        .insert([{
          user_id: subscription.users.id,
          email_type: 'trial-ending',
          reminder_key: reminderKey,
          sent_at: new Date().toISOString(),
        }])

      remindersSent++
      console.log(`✅ Sent trial reminder to ${subscription.users.email} (${daysRemaining} days left)`)
    }

    console.log(`📧 Sent ${remindersSent} trial ending reminders`)

    return NextResponse.json({
      success: true,
      remindersSent: remindersSent,
    })
  } catch (error) {
    console.error('❌ Error checking trial reminders:', error)
    return NextResponse.json({ error: 'Failed to check trial reminders' }, { status: 500 })
  }
}