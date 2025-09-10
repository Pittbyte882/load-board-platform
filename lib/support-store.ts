interface SupportTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole: "broker" | "carrier" | "dispatcher"
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  updatedAt: string
  assignedTo?: string
  responses: SupportResponse[]
}

interface SupportResponse {
  id: string
  ticketId: string
  senderId: string
  senderName: string
  senderType: "user" | "admin"
  message: string
  timestamp: string
  attachments?: string[]
}

// In-memory store for support tickets (in a real app, this would be a database)
const supportTickets: SupportTicket[] = [
  {
    id: "ticket-001",
    userId: "user-123",
    userName: "John Smith",
    userEmail: "john@example.com",
    userRole: "carrier",
    subject: "Unable to claim loads",
    message: "I'm having trouble claiming loads on the platform. When I click the claim button, nothing happens.",
    status: "open",
    priority: "high",
    createdAt: "2024-01-15 10:30 AM",
    updatedAt: "2024-01-15 10:30 AM",
    responses: [],
  },
  {
    id: "ticket-002",
    userId: "user-456",
    userName: "Sarah Johnson",
    userEmail: "sarah@logistics.com",
    userRole: "broker",
    subject: "Payment processing issue",
    message: "My payment for the monthly subscription failed. Can you help me update my payment method?",
    status: "in_progress",
    priority: "medium",
    createdAt: "2024-01-14 2:15 PM",
    updatedAt: "2024-01-15 9:45 AM",
    assignedTo: "Admin Team",
    responses: [
      {
        id: "response-001",
        ticketId: "ticket-002",
        senderId: "admin-001",
        senderName: "Support Team",
        senderType: "admin",
        message:
          "Hi Sarah, I can help you with that. Please check your email for instructions on updating your payment method.",
        timestamp: "2024-01-15 9:45 AM",
      },
    ],
  },
  {
    id: "ticket-003",
    userId: "user-789",
    userName: "Mike Rodriguez",
    userEmail: "mike@dispatch.com",
    userRole: "dispatcher",
    subject: "Feature request: Driver tracking",
    message: "Would it be possible to add real-time driver tracking to the dispatcher dashboard?",
    status: "resolved",
    priority: "low",
    createdAt: "2024-01-12 11:20 AM",
    updatedAt: "2024-01-13 3:30 PM",
    assignedTo: "Product Team",
    responses: [
      {
        id: "response-002",
        ticketId: "ticket-003",
        senderId: "admin-002",
        senderName: "Product Team",
        senderType: "admin",
        message: "Thanks for the suggestion! We've added this to our product roadmap for Q2 2024.",
        timestamp: "2024-01-13 3:30 PM",
      },
    ],
  },
]

export const supportStore = {
  // Get all tickets
  getAllTickets: (): SupportTicket[] => {
    return [...supportTickets]
  },

  // Get tickets for a specific user
  getUserTickets: (userId: string): SupportTicket[] => {
    return supportTickets.filter((ticket) => ticket.userId === userId)
  },

  // Create a new ticket
  createTicket: (ticketData: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "responses">): SupportTicket => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `ticket-${Date.now()}`,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      responses: [],
    }

    supportTickets.unshift(newTicket)

    // Notify admin dashboard about new ticket
    window.dispatchEvent(
      new CustomEvent("supportTicketCreated", {
        detail: { ticket: newTicket },
      }),
    )

    return newTicket
  },

  // Update ticket status
  updateTicketStatus: (ticketId: string, status: SupportTicket["status"]): void => {
    const ticketIndex = supportTickets.findIndex((ticket) => ticket.id === ticketId)
    if (ticketIndex !== -1) {
      supportTickets[ticketIndex] = {
        ...supportTickets[ticketIndex],
        status,
        updatedAt: new Date().toLocaleString(),
      }

      // Notify about ticket update
      window.dispatchEvent(
        new CustomEvent("supportTicketUpdated", {
          detail: { ticketId, status },
        }),
      )
    }
  },

  // Add response to ticket
  addResponse: (ticketId: string, response: Omit<SupportResponse, "id" | "timestamp">): void => {
    const ticketIndex = supportTickets.findIndex((ticket) => ticket.id === ticketId)
    if (ticketIndex !== -1) {
      const newResponse: SupportResponse = {
        ...response,
        id: `response-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
      }

      supportTickets[ticketIndex] = {
        ...supportTickets[ticketIndex],
        responses: [...supportTickets[ticketIndex].responses, newResponse],
        updatedAt: new Date().toLocaleString(),
        status: response.senderType === "admin" ? "in_progress" : supportTickets[ticketIndex].status,
      }

      // Notify about new response
      window.dispatchEvent(
        new CustomEvent("supportResponseAdded", {
          detail: { ticketId, response: newResponse },
        }),
      )
    }
  },

  // Assign ticket
  assignTicket: (ticketId: string, assignee: string): void => {
    const ticketIndex = supportTickets.findIndex((ticket) => ticket.id === ticketId)
    if (ticketIndex !== -1) {
      supportTickets[ticketIndex] = {
        ...supportTickets[ticketIndex],
        assignedTo: assignee,
        updatedAt: new Date().toLocaleString(),
      }

      // Notify about ticket assignment
      window.dispatchEvent(
        new CustomEvent("supportTicketAssigned", {
          detail: { ticketId, assignee },
        }),
      )
    }
  },

  // Get ticket by ID
  getTicketById: (ticketId: string): SupportTicket | undefined => {
    return supportTickets.find((ticket) => ticket.id === ticketId)
  },
}

export type { SupportTicket, SupportResponse }
