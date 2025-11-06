import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface PasswordChangedEmailProps {
  userName: string
  changeTime: string
}

export const PasswordChangedEmail = ({
  userName = 'User',
  changeTime = new Date().toLocaleString(),
}: PasswordChangedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your BOXALOO password was changed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Password Changed 🔐</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Your BOXALOO account password was successfully changed on {changeTime}.
          </Text>

          <Text style={text}>
            If you made this change, you can safely ignore this email.
          </Text>

          <Hr style={hr} />

          <Text style={alertText}>
            ⚠️ If you did NOT make this change, please contact our support team immediately at support@boxaloo.com
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            BOXALOO Security Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default PasswordChangedEmail

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

const alertText = {
  color: '#dc2626',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '20px 40px',
  backgroundColor: '#fee2e2',
  borderRadius: '5px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  textAlign: 'center' as const,
}