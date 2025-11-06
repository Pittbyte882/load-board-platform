import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface SupportReplyEmailProps {
  userName: string
  ticketId: string
  subject: string
  replyMessage: string
  supportAgentName: string
  dashboardUrl: string
}

export const SupportReplyEmail = ({
  userName = 'User',
  ticketId = '12345',
  subject = 'Support Request',
  replyMessage = 'Support reply',
  supportAgentName = 'Support Team',
  dashboardUrl = 'https://boxaloo.com/dashboard',
}: SupportReplyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Reply on Ticket #{ticketId} - {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Response on Your Ticket 💬</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            {supportAgentName} has replied to your support ticket #{ticketId}.
          </Text>

          <Section style={replyBox}>
            <Text style={replyHeader}>
              <strong>{supportAgentName}</strong> replied:
            </Text>
            <Hr style={hr} />
            <Text style={replyMessage}>
              {replyMessage}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${dashboardUrl}#support`}>
              View & Reply
            </Button>
          </Section>

          <Text style={text}>
            <strong>Ticket Details:</strong><br />
            Ticket ID: #{ticketId}<br />
            Subject: {subject}
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            BOXALOO Support Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default SupportReplyEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const replyBox = {
  backgroundColor: '#e8f5e9',
  borderLeft: '4px solid #16a34a',
  borderRadius: '5px',
  margin: '20px 40px',
  padding: '20px',
}

const replyHeader = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 10px',
}

const replyMessage = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '10px 0 0',
}

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  textAlign: 'center' as const,
}