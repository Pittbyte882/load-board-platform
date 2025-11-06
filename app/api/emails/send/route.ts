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

      default:
        console.log(`📧 Email type ${type} not yet implemented`)
        return NextResponse.json({ success: true, message: 'Email type not yet implemented' })
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