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
}

interface MessagingState {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  loading: boolean
  fetchConversations: (userId: string) => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  addMessage: (message: Omit<Message, "id" | "timestamp">) => Promise<void>
  markAsRead: (conversationId: string, userId: string) => Promise<void>
  getConversationsForUser: (userId: string) => Conversation[]
  getMessagesForConversation: (conversationId: string) => Message[]
  createConversation: (
    participants: Conversation["participants"],
    loadId?: string,
    loadRoute?: string
  ) => Promise<string>
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: [],
  messages: {},
  loading: false,

  fetchConversations: async (userId: string) => {
    try {
      set({ loading: true })
      const response = await fetch(`/api/messages/conversations?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch conversations')
      
      const data = await response.json()
      set({ conversations: data.conversations })
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchMessages: async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      
      const data = await response.json()
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: data.messages
        }
      }))
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  },

  addMessage: async (messageData) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const { message } = await response.json()
      
      // Update local state
      set((state) => {
        const conversationMessages = state.messages[messageData.conversationId] || []
        return {
          messages: {
            ...state.messages,
            [messageData.conversationId]: [...conversationMessages, {
              id: message.id,
              ...messageData,
              timestamp: message.created_at
            }]
          },
          conversations: state.conversations.map(conv => 
            conv.id === messageData.conversationId
              ? {
                  ...conv,
                  lastMessage: messageData.content,
                  lastMessageTime: message.created_at,
                  unreadCount: conv.unreadCount + 1
                }
              : conv
          )
        }
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  },

  markAsRead: async (conversationId: string, userId: string) => {
    try {
      const response = await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userId })
      })

      if (!response.ok) throw new Error('Failed to mark messages as read')

      // Update local state
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: (state.messages[conversationId] || []).map(msg =>
            msg.receiverId === userId ? { ...msg, read: true } : msg
          )
        },
        conversations: state.conversations.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      }))
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  },

  getConversationsForUser: (userId: string) => {
    return get().conversations
  },

  getMessagesForConversation: (conversationId: string) => {
    return get().messages[conversationId] || []
  },

  createConversation: async (participants, loadId, loadRoute) => {
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants, loadId, loadRoute })
      })

      if (!response.ok) throw new Error('Failed to create conversation')
      
      const { conversationId } = await response.json()
      
      // Refresh conversations
      const firstParticipant = participants[0]
      if (firstParticipant) {
        await get().fetchConversations(firstParticipant.id)
      }
      
      return conversationId
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  },
}))