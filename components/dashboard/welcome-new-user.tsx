"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Package, Users } from "lucide-react"

interface WelcomeNewUserProps {
  userName: string
  userRole: string
  onGetStarted: () => void
}

export function WelcomeNewUser({ userName, userRole, onGetStarted }: WelcomeNewUserProps) {
  const getRoleSpecificContent = () => {
    switch (userRole) {
      case "broker":
        return {
          icon: <Building2 className="h-12 w-12 text-blue-600" />,
          title: "Welcome to Your Broker Dashboard",
          description: "Start posting loads and connecting with carriers",
          nextSteps: [
            "Post your first load",
            "Browse available trucks",
            "Set up your company profile",
            "Explore pricing options"
          ]
        }
      case "carrier":
        return {
          icon: <Package className="h-12 w-12 text-green-600" />,
          title: "Welcome to Your Carrier Dashboard", 
          description: "Find loads and grow your business",
          nextSteps: [
            "Search for available loads",
            "Post your truck availability",
            "Complete your profile",
            "Set up notifications"
          ]
        }
      case "dispatcher":
        return {
          icon: <Users className="h-12 w-12 text-purple-600" />,
          title: "Welcome to Your Dispatcher Dashboard",
          description: "Manage carriers and coordinate loads",
          nextSteps: [
            "Add carriers to your fleet",
            "Search for loads",
            "Set up route planning",
            "Configure notifications"
          ]
        }
      default:
        return {
          icon: <Building2 className="h-12 w-12 text-gray-600" />,
          title: "Welcome to Your Dashboard",
          description: "Get started with your account",
          nextSteps: ["Complete your profile", "Explore features"]
        }
    }
  }

  const content = getRoleSpecificContent()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>
          <CardTitle className="text-2xl">
            Welcome, {userName}!
          </CardTitle>
          <CardDescription className="text-lg">
            {content.title}
          </CardDescription>
          <p className="text-gray-600 mt-2">
            {content.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Next Steps:</h3>
            <ul className="space-y-2">
              {content.nextSteps.map((step, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <Button 
              onClick={onGetStarted}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}