import { NextResponse } from 'next/server'
import { resend, EMAIL_FROM } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const { type, to, data } = await request.json()

    console.log(`📧 Sending ${type} email to:`, to)

    let emailHtml: string
    let subject: string

    switch (type) {
      case 'welcome':
        const roleNames = {
          carrier: 'Carrier',
          broker: 'Broker',
          dispatcher: 'Dispatcher',
        }
        
        emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #16a34a; text-align: center;">Welcome to BOXALOO! 🎉</h1>
              
              <p>Hi ${data.userName},</p>
              
              <p>
                Thank you for signing up as a ${roleNames[data.userRole as keyof typeof roleNames]}! 
                Your ${data.trialDays}-day free trial has started, and you now have full access to all features.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a 
                  href="${data.loginUrl}"
                  style="background-color: #16a34a; color: white; padding: 12px 32px; text-decoration: none; border-radius: 5px; display: inline-block;"
                >
                  Access Your Dashboard
                </a>
              </div>

              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />

              <h2 style="color: #333;">What's Next?</h2>
              
              <ul>
                ${data.userRole === 'carrier' ? `
                  <li>Search and book profitable loads</li>
                  <li>Set up your truck preferences</li>
                  <li>Complete your carrier profile</li>
                ` : ''}
                ${data.userRole === 'broker' ? `
                  <li>Post your first load</li>
                  <li>Search for qualified carriers</li>
                  <li>Set up your broker profile</li>
                ` : ''}
                ${data.userRole === 'dispatcher' ? `
                  <li>Add your drivers</li>
                  <li>Start finding loads</li>
                  <li>Set up your dispatch workflow</li>
                ` : ''}
              </ul>

              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />

              <p><strong>Trial Details:</strong></p>
              <ul>
                <li>Duration: ${data.trialDays} days</li>
                <li>Full feature access</li>
                <li>No credit card charged until trial ends</li>
                <li>Cancel anytime</li>
              </ul>

              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />

              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                Need help? Reply to this email or contact us at support@boxaloo.com
              </p>

              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                BOXALOO - Box Truck & Cargo Van Load Board
              </p>
            </body>
          </html>
        `
        
        subject = `Welcome to BOXALOO - Your ${data.trialDays}-day trial has started!`
        break
      
        case 'trial-ending':
  emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f59e0b; text-align: center;">Your Trial is Ending Soon ⏰</h1>
        
        <p>Hi ${data.userName},</p>
        
        <p>
          Your ${data.trialDays}-day free trial of BOXALOO ${data.planName} will end in 
          <strong style="color: #dc2626;">${data.daysRemaining} day(s)</strong>.
        </p>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>What happens next?</strong><br>
            On ${data.chargeDate}, your card will be charged <strong>$${data.amount}</strong> for your monthly subscription.
          </p>
        </div>

        <h2 style="color: #333;">Your Options:</h2>
        
        <div style="margin: 20px 0;">
          <div style="text-align: center; margin-bottom: 10px;">
            <a 
              href="${data.dashboardUrl}#subscription"
              style="background-color: #16a34a; color: white; padding: 12px 32px; text-decoration: none; border-radius: 5px; display: inline-block;"
            >
              Continue Subscription
            </a>
          </div>
          
          <div style="text-align: center;">
            <a 
              href="${data.dashboardUrl}#subscription"
              style="background-color: #dc2626; color: white; padding: 12px 32px; text-decoration: none; border-radius: 5px; display: inline-block;"
            >
              Cancel Before Charge
            </a>
          </div>
        </div>

        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />

        <h2 style="color: #333;">What You've Accomplished:</h2>
        
        <ul>
          <li>Loads searched: ${data.stats?.loadsSearched || 0}</li>
          <li>Bookings made: ${data.stats?.bookingsMade || 0}</li>
          <li>Time saved: ${data.stats?.timeSaved || 'Significant'}</li>
        </ul>

        <p>
          We'd love to continue helping you grow your business! If you have any questions or concerns, 
          please reply to this email or contact our support team.
        </p>

        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />

        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          BOXALOO - Box Truck & Cargo Van Load Board
        </p>
      </body>
    </html>
  `
  
  subject = `Your ${data.planName} trial ends in ${data.daysRemaining} day(s)`
  break
      case 'payment-reminder':
        emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb; text-align: center;">Upcoming Payment Reminder 💳</h1>
              
              <p>Hi ${data.userName},</p>
              
              <p>
                This is a friendly reminder that your BOXALOO subscription payment is coming up soon.
              </p>

              <div style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>Payment Details:</strong><br>
                  Amount: <strong>$${data.amount}</strong><br>
                  Billing Date: <strong>${data.billingDate}</strong><br>
                  Payment Method: ${data.cardBrand} ending in ${data.last4}
                </p>
              </div>

              <p>
                Your subscription will automatically renew, and your card will be charged on the date above.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a 
                  href="${data.dashboardUrl}#subscription"
                  style="background-color: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 5px; display: inline-block;"
                >
                  Manage Subscription
                </a>
              </div>

              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />

              <h2 style="color: #333;">Need to Make Changes?</h2>
              
              <p>You can:</p>
              <ul>
                <li>Update your payment method</li>
                <li>View your billing history</li>
                <li>Cancel your subscription (access continues until ${data.billingDate})</li>
              </ul>

              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />

              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                Questions? Contact us at support@boxaloo.com
              </p>

              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                BOXALOO - Box Truck & Cargo Van Load Board
              </p>
            </body>
          </html>
        `
        
        subject = `Payment reminder: $${data.amount} will be charged in 3 days`
        break

      default:
        console.log(`📧 Email type ${type} not yet implemented`)
        return NextResponse.json({ success: true, message: 'Email type not yet implemented' })
   
        case 'support-reply':
  subject = `Re: ${data.ticketSubject} - Support Team Response`
  emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; text-align: center;">Support Team Response 💬</h1>
        
        <p>Hi ${data.userName},</p>
        
        <p>Our support team has responded to your ticket: <strong>${data.ticketSubject}</strong></p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
          <p><strong>Response from ${data.supportTeamName}:</strong></p>
          <p style="color: #333;">${data.replyMessage.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${data.ticketUrl}"
            style="background-color: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 5px; display: inline-block;"
          >
            View Full Conversation
          </a>
        </div>
        
        <p>You can reply to this ticket by logging into your dashboard.</p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6c757d; font-size: 12px; text-align: center;">
          This email was sent regarding support ticket in your BOXALOO account.
        </p>
      </body>
    </html>
  `
  break
      }

    console.log('📧 Sending email with HTML length:', emailHtml.length)

    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: subject,
      html: emailHtml,
    })

    if (error) {
      console.error('❌ Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Email sent successfully:', emailData?.id)

    return NextResponse.json({ success: true, emailId: emailData?.id })
  } catch (error: any) {
    console.error('❌ Error sending email:', error)
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 })
  }
}