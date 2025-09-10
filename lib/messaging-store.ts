"use client"

import { create } from "zustand"

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "broker" | "carrier" | "dispatcher"
  senderCompany: string
  receiverId: string
  receiverName: string
  receiverRole: "broker" | "carrier" | "dispatcher"
  receiverCompany: string
  content: string
  timestamp: string
  read: boolean
  loadId?: string
  conversationId: string
}

export interface Conversation {
  id: string
  participants: Array<{
    id: string
    name: string
    role: "broker" | "carrier" | "dispatcher"
    company: string
    mcNumber?: string
  }>
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  loadId?: string
  loadRoute?: string
  messages: Message[]
}

interface MessagingState {
  conversations: Conversation[]
  messages: Message[]
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  markAsRead: (conversationId: string, userId: string) => void
  getConversationsForUser: (userId: string) => Conversation[]
  getMessagesForConversation: (conversationId: string) => Message[]
  createConversation: (participants: Conversation["participants"], loadId?: string, loadRoute?: string) => string
}

// Mock data for cross-role communication
const initialConversations: Conversation[] = [
  {
    id: "conv-broker-carrier-1",
    participants: [
      { id: "broker1", name: "John Smith", role: "broker", company: "Smith Logistics", mcNumber: "MC-123456" },
      { id: "carrier1", name: "Mike Johnson", role: "carrier", company: "Johnson Transport", mcNumber: "MC-789012" },
    ],
    lastMessage: "Load delivered successfully. Invoice attached.",
    lastMessageTime: "2024-01-15T14:30:00Z",
    unreadCount: 1,
    loadId: "L001",
    loadRoute: "Atlanta, GA → Miami, FL",
    messages: [
      {
        id: "msg-1",
        senderId: "carrier1",
        senderName: "Mike Johnson",
        senderRole: "carrier",
        senderCompany: "Johnson Transport",
        receiverId: "broker1",
        receiverName: "John Smith",
        receiverRole: "broker",
        receiverCompany: "Smith Logistics",
        content: "Hi, I'm interested in your load from Atlanta to Miami. Is it still available?",
        timestamp: "2024-01-15T09:00:00Z",
        read: true,
        loadId: "L001",
        conversationId: "conv-broker-carrier-1",
      },
      {
        id: "msg-2",
        senderId: "broker1",
        senderName: "John Smith",
        senderRole: "broker",
        senderCompany: "Smith Logistics",
        receiverId: "carrier1",
        receiverName: "Mike Johnson",
        receiverRole: "carrier",
        receiverCompany: "Johnson Transport",
        content: "Yes, it's available! Rate is $2,800. Can you pick up tomorrow at 8 AM?",
        timestamp: "2024-01-15T09:15:00Z",
        read: true,
        loadId: "L001",
        conversationId: "conv-broker-carrier-1",
      },
      {
        id: "msg-3",
        senderId: "carrier1",
        senderName: "Mike Johnson",
        senderRole: "carrier",
        senderCompany: "Johnson Transport",
        receiverId: "broker1",
        receiverName: "John Smith",
        receiverRole: "broker",
        receiverCompany: "Smith Logistics",
        content: "Perfect! My driver will be there at 8 AM sharp.",
        timestamp: "2024-01-15T13:30:00Z",
        read: true,
        loadId: "L001",
        conversationId: "conv-broker-carrier-1",
      },
      {
        id: "msg-4",
        senderId: "carrier1",
        senderName: "Mike Johnson",
        senderRole: "carrier",
        senderCompany: "Johnson Transport",
        receiverId: "broker1",
        receiverName: "John Smith",
        receiverRole: "broker",
        receiverCompany: "Smith Logistics",
        content: "Load delivered successfully. Invoice attached.",
        timestamp: "2024-01-15T14:30:00Z",
        read: false,
        loadId: "L001",
        conversationId: "conv-broker-carrier-1",
      },
    ],
  },
  {
    id: "conv-dispatcher-carrier-1",
    participants: [
      {
        id: "dispatcher1",
        name: "Sarah Wilson",
        role: "dispatcher",
        company: "Wilson Dispatch",
        mcNumber: "MC-345678",
      },
      {
        id: "carrier2",
        name: "Carlos Rodriguez",
        role: "carrier",
        company: "Rodriguez Logistics",
        mcNumber: "MC-901234",
      },
    ],
    lastMessage: "Running 30 minutes late due to traffic",
    lastMessageTime: "2024-01-15T10:45:00Z",
    unreadCount: 1,
    loadId: "L003",
    loadRoute: "Phoenix, AZ → Las Vegas, NV",
    messages: [
      {
        id: "msg-5",
        senderId: "dispatcher1",
        senderName: "Sarah Wilson",
        senderRole: "dispatcher",
        senderCompany: "Wilson Dispatch",
        receiverId: "carrier2",
        receiverName: "Carlos Rodriguez",
        receiverRole: "carrier",
        receiverCompany: "Rodriguez Logistics",
        content: "Hi Carlos, I have a load from Phoenix to Las Vegas. Are you available?",
        timestamp: "2024-01-15T08:00:00Z",
        read: true,
        loadId: "L003",
        conversationId: "conv-dispatcher-carrier-1",
      },
      {
        id: "msg-6",
        senderId: "carrier2",
        senderName: "Carlos Rodriguez",
        senderRole: "carrier",
        senderCompany: "Rodriguez Logistics",
        receiverId: "dispatcher1",
        receiverName: "Sarah Wilson",
        receiverRole: "dispatcher",
        receiverCompany: "Wilson Dispatch",
        content: "Yes, I can handle that. What's the pickup time?",
        timestamp: "2024-01-15T08:15:00Z",
        read: true,
        loadId: "L003",
        conversationId: "conv-dispatcher-carrier-1",
      },
      {
        id: "msg-7",
        senderId: "carrier2",
        senderName: "Carlos Rodriguez",
        senderRole: "carrier",
        senderCompany: "Rodriguez Logistics",
        receiverId: "dispatcher1",
        receiverName: "Sarah Wilson",
        receiverRole: "dispatcher",
        receiverCompany: "Wilson Dispatch",
        content: "Running 30 minutes late due to traffic",
        timestamp: "2024-01-15T10:45:00Z",
        read: false,
        loadId: "L003",
        conversationId: "conv-dispatcher-carrier-1",
      },
    ],
  },
  {
    id: "conv-broker-dispatcher-1",
    participants: [
      { id: "broker2", name: "David Chen", role: "broker", company: "Chen Freight", mcNumber: "MC-567890" },
      {
        id: "dispatcher2",
        name: "Lisa Martinez",
        role: "dispatcher",
        company: "Martinez Dispatch",
        mcNumber: "MC-234567",
      },
    ],
    lastMessage: "Can you confirm pickup time for tomorrow?",
    lastMessageTime: "2024-01-15T12:15:00Z",
    unreadCount: 2,
    loadId: "L002",
    loadRoute: "Houston, TX → Dallas, TX",
    messages: [
      {
        id: "msg-8",
        senderId: "broker2",
        senderName: "David Chen",
        senderRole: "broker",
        senderCompany: "Chen Freight",
        receiverId: "dispatcher2",
        receiverName: "Lisa Martinez",
        receiverRole: "dispatcher",
        receiverCompany: "Martinez Dispatch",
        content: "Hi Lisa, I have a load from Houston to Dallas. Can your team handle it?",
        timestamp: "2024-01-15T11:00:00Z",
        read: true,
        loadId: "L002",
        conversationId: "conv-broker-dispatcher-1",
      },
      {
        id: "msg-9",
        senderId: "dispatcher2",
        senderName: "Lisa Martinez",
        senderRole: "dispatcher",
        senderCompany: "Martinez Dispatch",
        receiverId: "broker2",
        receiverName: "David Chen",
        receiverRole: "broker",
        receiverCompany: "Chen Freight",
        content: "Yes, we can handle that. What's the rate and timeline?",
        timestamp: "2024-01-15T11:30:00Z",
        read: true,
        loadId: "L002",
        conversationId: "conv-broker-dispatcher-1",
      },
      {
        id: "msg-10",
        senderId: "broker2",
        senderName: "David Chen",
        senderRole: "broker",
        senderCompany: "Chen Freight",
        receiverId: "dispatcher2",
        receiverName: "Lisa Martinez",
        receiverRole: "dispatcher",
        receiverCompany: "Martinez Dispatch",
        content: "Can you confirm pickup time for tomorrow?",
        timestamp: "2024-01-15T12:15:00Z",
        read: false,
        loadId: "L002",
        conversationId: "conv-broker-dispatcher-1",
      },
    ],
  },
]

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: initialConversations,
  messages: initialConversations.flatMap((conv) => conv.messages),

  addMessage: (messageData) => {
    const newMessage: Message = {
      ...messageData,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    set((state) => {
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === messageData.conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: messageData.content,
            lastMessageTime: newMessage.timestamp,
            unreadCount: conv.unreadCount + 1,
          }
        }
        return conv
      })

      return {
        conversations: updatedConversations,
        messages: [...state.messages, newMessage],
      }
    })
  },

  markAsRead: (conversationId, userId) => {
    set((state) => {
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          const updatedMessages = conv.messages.map((msg) => {
            if (msg.receiverId === userId) {
              return { ...msg, read: true }
            }
            return msg
          })
          return {
            ...conv,
            messages: updatedMessages,
            unreadCount: 0,
          }
        }
        return conv
      })

      const updatedMessages = state.messages.map((msg) => {
        if (msg.conversationId === conversationId && msg.receiverId === userId) {
          return { ...msg, read: true }
        }
        return msg
      })

      return {
        conversations: updatedConversations,
        messages: updatedMessages,
      }
    })
  },

  getConversationsForUser: (userId) => {
    const state = get()
    return state.conversations.filter((conv) => conv.participants.some((p) => p.id === userId))
  },

  getMessagesForConversation: (conversationId) => {
    const state = get()
    return state.messages.filter((msg) => msg.conversationId === conversationId)
  },

  createConversation: (participants, loadId, loadRoute) => {
    const conversationId = `conv-${Date.now()}`
    const newConversation: Conversation = {
      id: conversationId,
      participants,
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      loadId,
      loadRoute,
      messages: [],
    }

    set((state) => ({
      conversations: [...state.conversations, newConversation],
    }))

    return conversationId
  },
}))
