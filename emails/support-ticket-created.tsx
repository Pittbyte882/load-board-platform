import * as React from 'react'

interface SupportTicketCreatedEmailProps {
  userName: string
  ticketId: string
  subject: string
  message: string
  priority: string
  dashboardUrl: string
}

export const SupportTicketCreatedEmail = ({
  userName = 'User',
  ticketId = '12345',
  subject = 'Support Request',
  message = 'Support message',
  priority = 'medium',
  dashboardUrl = 'https://boxaloo.com/dashboard',
}: SupportTicketCreatedEmailProps) => {
  return (
    <div>
      <h1>Support Ticket Created</h1>
      <p>Hi {userName},</p>
      <p>We've received your support request.</p>
      <p><strong>Ticket ID:</strong> #{ticketId}</p>
      <p><strong>Subject:</strong> {subject}</p>
      <p><strong>Priority:</strong> {priority}</p>
      <p><strong>Your Message:</strong></p>
      <p>{message}</p>
      <p><a href={`${dashboardUrl}#support`}>View Ticket</a></p>
    </div>
  )
}

export default SupportTicketCreatedEmail