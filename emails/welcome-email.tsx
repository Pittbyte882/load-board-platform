import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  userName: string
  userRole: 'carrier' | 'broker' | 'dispatcher'
  trialDays: number
  loginUrl: string
}

export const WelcomeEmail = ({
  userName = 'User',
  userRole = 'carrier',
  trialDays = 7,
  loginUrl = 'https://boxaloo.com/login',
}: WelcomeEmailProps) => {
  const roleNames = {
    carrier: 'Carrier',
    broker: 'Broker',
    dispatcher: 'Dispatcher',
  }

  return (
    <Html>
      <Head />
      <Preview>Welcome to BOXALOO - Your {trialDays}-day free trial has started!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to BOXALOO! 🎉</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Thank you for signing up as a {roleNames[userRole]}! Your {trialDays}-day free trial has started, and you now have full access to all features.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Access Your Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>What's Next?</Heading>
          
          <Text style={text}>
            {userRole === 'carrier' && '• Search and book profitable loads\n• Set up your truck preferences\n• Complete your carrier profile'}
            {userRole === 'broker' && '• Post your first load\n• Search for qualified carriers\n• Set up your broker profile'}
            {userRole === 'dispatcher' && '• Add your drivers\n• Start finding loads\n• Set up your dispatch workflow'}
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            <strong>Trial Details:</strong><br />
            • Duration: {trialDays} days<br />
            • Full feature access<br />
            • No credit card charged until trial ends<br />
            • Cancel anytime
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Reply to this email or contact us at support@boxaloo.com
          </Text>

          <Text style={footer}>
            BOXALOO - Box Truck & Cargo Van Load Board
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

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

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '30px 0 15px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
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
  margin: '20px 40px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  textAlign: 'center' as const,
}