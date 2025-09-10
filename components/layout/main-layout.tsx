"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarInitials } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Truck,
  Package,
  Users,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  BarChart3,
  CreditCard,
  FileText,
  Map,
  Calendar,
  TrendingUp,
  Activity,
} from "lucide-react"
import Image from "next/image"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState(3)

  // Navigation items based on user role
  type NavigationItem = {
    title: string
    icon: any // or your specific icon type
    href: string
    isActive: boolean
    onClick?: () => void
    badge?: string | number
  }

  const getNavigationItems = (): NavigationItem[] => {
    const baseItems = [
      {
        title: "Dashboard",
        icon: BarChart3,
        href: "/dashboard",
        isActive: true,
      }
    ]
    
    if (user?.role === "carrier") {
      return [
        ...baseItems,
        {
          title: "Find Loads",
          icon: Package,
          href: "#find-loads",
          isActive: false,
          onClick: () => dispatchCarrierTabChange("find-loads"),
        },
        {
          title: "Booked Loads",
          icon: Calendar,
          href: "#booked-loads",
          isActive: false,
          onClick: () => dispatchCarrierTabChange("booked-loads"),
        },
        {
          title: "Post Truck",
          icon: Truck,
          href: "#post-truck",
          isActive: false,
          onClick: () => dispatchCarrierTabChange("post-truck"),
        },
        {
          title: "Profile",
          icon: User,
          href: "#profile",
          isActive: false,
          onClick: () => dispatchCarrierTabChange("profile"),
        },
        {
          title: "Subscription",
          icon: CreditCard,
          href: "#subscription",
          isActive: false,
          onClick: () => dispatchCarrierTabChange("subscription"),
        },
      ]
    }

    if (user?.role === "broker") {
      return [
        ...baseItems,
        {
          title: "Post Load",
          icon: Plus,
          href: "#post-load",
          isActive: false,
          onClick: () => dispatchBrokerTabChange("post-load"),
        },
        {
          title: "My Loads",
          icon: Package,
          href: "#my-loads",
          isActive: false,
          onClick: () => dispatchBrokerTabChange("my-loads"),
        },
        {
          title: "Available Trucks",
          icon: Truck,
          href: "#available-trucks",
          isActive: false,
          onClick: () => dispatchBrokerTabChange("available-trucks"),
        },
        {
          title: "Messages",
          icon: MessageSquare,
          href: "#messages",
          isActive: false,
          onClick: () => dispatchBrokerTabChange("messages"),
          badge: notifications > 0 ? notifications.toString() : undefined,
        },
        {
          title: "Analytics",
          icon: TrendingUp,
          href: "#analytics",
          isActive: false,
          onClick: () => dispatchBrokerTabChange("analytics"),
        },
      ]
    }

    if (user?.role === "dispatcher") {
      return [
        ...baseItems,
        {
          title: "Manage Carriers",
          icon: Users,
          href: "#carriers",
          isActive: false,
          onClick: () => dispatchDispatcherTabChange("carriers"),
        },
        {
          title: "Find Loads",
          icon: Package,
          href: "#loads",
          isActive: false,
          onClick: () => dispatchDispatcherTabChange("loads"),
        },
        {
          title: "Route Planning",
          icon: Map,
          href: "#route-planning",
          isActive: false,
          onClick: () => dispatchDispatcherTabChange("route-planning"),
        },
        {
          title: "Messages",
          icon: MessageSquare,
          href: "#messages",
          isActive: false,
          onClick: () => dispatchDispatcherTabChange("messages"),
          badge: notifications > 0 ? notifications.toString() : undefined,
        },
        {
          title: "Support",
          icon: FileText,
          href: "#support",
          isActive: false,
          onClick: () => dispatchDispatcherTabChange("support"),
        },
        {
          title: "Profile",
          icon: User,
          href: "#profile",
          isActive: false,
          onClick: () => dispatchDispatcherTabChange("profile"),
        },
      ]
    }

    if (user?.role === "admin") {
      return [
        ...baseItems,
        {
          title: "Users",
          icon: Users,
          href: "#users",
          isActive: false,
          onClick: () => dispatchTabChange("users"),
        },
        {
          title: "Loads",
          icon: Package,
          href: "#loads",
          isActive: false,
          onClick: () => dispatchTabChange("loads"),
        },
        {
          title: "Pricing",
          icon: CreditCard,
          href: "#pricing",
          isActive: false,
          onClick: () => dispatchTabChange("pricing"),
        },
        {
          title: "Support",
          icon: MessageSquare,
          href: "#support",
          isActive: false,
          onClick: () => dispatchTabChange("support"),
        },
        {
          title: "Settings",
          icon: Settings,
          href: "#settings",
          isActive: false,
          onClick: () => dispatchTabChange("settings"),
        },
        {
          title: "Analytics",
          icon: Activity,
          href: "#analytics",
          isActive: false,
          onClick: () => dispatchTabChange("analytics"),
        },
      ]
    }

    return baseItems
  } // This closes the getNavigationItems function - REMOVE THE EXTRA } AFTER THIS LINE

  const dispatchTabChange = (tab: string) => {
    window.dispatchEvent(new CustomEvent("adminTabChange", { detail: { tab } }))
    // Update URL hash
    window.location.hash = tab
  }

  const dispatchBrokerTabChange = (tab: string) => {
    window.dispatchEvent(new CustomEvent("dashboardTabChange", { detail: { tab } }))
    // Update URL hash
    window.location.hash = tab
  }

  const dispatchCarrierTabChange = (tab: string) => {
    window.dispatchEvent(new CustomEvent("dashboardTabChange", { detail: { tab } }))
    // Update URL hash
    window.location.hash = tab
  }

  const dispatchDispatcherTabChange = (tab: string) => {
    window.dispatchEvent(new CustomEvent("dashboardTabChange", { detail: { tab } }))
    // Update URL hash
    window.location.hash = tab
  }

  const handleLogout = async () => {
    await logout()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "broker":
        return "bg-blue-100 text-blue-800"
      case "carrier":
        return "bg-green-100 text-green-800"
      case "dispatcher":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Image src="/images/boxaloo-logo.png" alt="BOXALOO" width={120} height={40} className="h-8 w-auto" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild={!item.onClick} isActive={item.isActive} onClick={item.onClick}>
                      {item.onClick ? (
                        <button className="flex items-center gap-2 w-full">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      ) : (
                        <a href={item.href} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarInitials name={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || "User" : "User"} />
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || "User" : "User"}</span> 
                      // handles if first or last name is missing // 
                      <Badge className={`text-xs ${getRoleColor(user?.role || "")}`}>{user?.role}</Badge>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-56">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">{notifications}</Badge>
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
    
