"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { showToastWithLogo } from "@/components/ui/custom-toasts"
import { Avatar, AvatarInitials } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MessageSquare, Send, Search, Phone, Mail, Package, Trash2 } from "lucide-react"
import { useMessagingStore } from "@/lib/messaging-store"
import { useAuth } from "@/lib/auth-context"

interface UniversalMessagesProps {
  userRole: "broker" | "carrier" | "dispatcher"
  filterOptions: string[]
  subtitle: string
}

export function UniversalMessages({ userRole, filterOptions, subtitle }: UniversalMessagesProps) {
  const { user } = useAuth()
  const { 
    getConversationsForUser, 
    getMessagesForConversation, 
    addMessage, 
    markAsRead,
    fetchConversations,
    fetchMessages,
    deleteMessage,
    deleteConversation
  } = useMessagingStore()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  const [isDeleteMessageDialogOpen, setIsDeleteMessageDialogOpen] = useState(false)
  const [isDeleteConversationDialogOpen, setIsDeleteConversationDialogOpen] = useState(false)

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations(user.id)
    }
  }, [user, fetchConversations])

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId)
    }
  }, [selectedConversationId, fetchMessages])

  // Get conversations for current user
  const conversations = user ? getConversationsForUser(user.id) : []

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p.id !== user?.id)
    if (!otherParticipant) return false

    const matchesSearch =
      otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherParticipant.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.loadRoute?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterType === "all" ||
      (filterType === "unread" && conv.unreadCount > 0) ||
      filterOptions.slice(2).some(
        (filter) => 
          filterType === filter.toLowerCase() && 
          otherParticipant.role === filter.toLowerCase()
      )

    return matchesSearch && matchesFilter
  })

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId)
  const conversationMessages = selectedConversationId ? getMessagesForConversation(selectedConversationId) : []

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    const otherParticipant = selectedConversation.participants.find((p) => p.id !== user.id)
    if (!otherParticipant) return

    await addMessage({
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: userRole,
      senderCompany: user.companyName,
      receiverId: otherParticipant.id,
      receiverName: otherParticipant.name,
      receiverRole: otherParticipant.role,
      receiverCompany: otherParticipant.company,
      content: newMessage,
      read: false,
      loadId: selectedConversation.loadId,
      conversationId: selectedConversationId!,
    })

    setNewMessage("")
  }

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId)
    if (user) {
      await markAsRead(conversationId, user.id)
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId)
    setIsDeleteMessageDialogOpen(true)
  }

  const confirmDeleteMessage = async () => {
    if (messageToDelete && selectedConversationId && user) {
      try {
        await deleteMessage(messageToDelete, selectedConversationId, user.id)
        setIsDeleteMessageDialogOpen(false)
        setMessageToDelete(null)
      } catch (error) {
        console.error('Failed to delete message:', error)
        showToastWithLogo({
        title: "Delete Failed",
        message: "Failed to delete message. You can only delete your own messages.",
        type: 'error'
      })
      }
    }
  }

  const handleDeleteConversation = (conversationId: string) => {
    setConversationToDelete(conversationId)
    setIsDeleteConversationDialogOpen(true)
  }

  const confirmDeleteConversation = async () => {
    if (conversationToDelete && user) {
      try {
        await deleteConversation(conversationToDelete, user.id)
        // Clear selection if the deleted conversation was selected
        if (selectedConversationId === conversationToDelete) {
          setSelectedConversationId(null)
        }
        setIsDeleteConversationDialogOpen(false)
        setConversationToDelete(null)
      } catch (error) {
        console.error('Failed to delete conversation:', error)
        showToastWithLogo({
        title: "Delete Failed",
        message: "Failed to delete conversation. Please try again.",
        type: 'error'
      })
      }
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString()
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "carrier":
        return "bg-blue-100 text-blue-800"
      case "dispatcher":
        return "bg-purple-100 text-purple-800"
      case "broker":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMessageBubbleColor = () => {
    switch (userRole) {
      case "broker":
        return "bg-blue-600 text-white"
      case "dispatcher":
        return "bg-green-600 text-white"
      case "carrier":
        return "bg-purple-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getMessageBubbleAccentColor = () => {
    switch (userRole) {
      case "broker":
        return "text-blue-100"
      case "dispatcher":
        return "text-green-100"
      case "carrier":
        return "text-purple-100"
      default:
        return "text-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <MessageSquare className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {filterOptions.map((filter) => (
                  <Button
                    key={filter}
                    variant={filterType === filter.toLowerCase() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(filter.toLowerCase())}
                    className="text-xs"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.participants.find((p) => p.id !== user?.id)
                  if (!otherParticipant) return null

                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b transition-colors relative group ${
                        selectedConversationId === conversation.id 
                          ? "bg-blue-50 border-blue-200" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Delete Conversation Button - appears on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteConversation(conversation.id)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div 
                        onClick={() => handleSelectConversation(conversation.id)} 
                        className="cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarInitials name={otherParticipant.name} />
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {otherParticipant.name}
                                {otherParticipant.mcNumber && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({otherParticipant.mcNumber})
                                  </span>
                                )}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getRoleColor(otherParticipant.role)}>
                                {otherParticipant.role}
                              </Badge>
                              <span className="text-xs text-gray-600 truncate">
                                {otherParticipant.company}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {conversation.lastMessage}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                              {conversation.loadId && (
                                <Badge variant="outline" className="text-xs">
                                  <Package className="h-3 w-3 mr-1" />
                                  {conversation.loadId}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const otherParticipant = selectedConversation.participants.find(
                        (p) => p.id !== user?.id
                      )
                      if (!otherParticipant) return null

                      return (
                        <>
                          <Avatar className="h-10 w-10">
                            <AvatarInitials name={otherParticipant.name} />
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {otherParticipant.name}
                              {otherParticipant.mcNumber && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({otherParticipant.mcNumber})
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Badge className={getRoleColor(otherParticipant.role)}>
                                {otherParticipant.role}
                              </Badge>
                              <span>{otherParticipant.company}</span>
                              {selectedConversation.loadId && (
                                <>
                                  <span>•</span>
                                  <Package className="h-4 w-4" />
                                  {selectedConversation.loadId}
                                </>
                              )}
                            </CardDescription>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-[400px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id ? "justify-end" : "justify-start"
                      } group`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg relative ${
                          message.senderId === user?.id 
                            ? getMessageBubbleColor()
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {/* Delete Message Button - only show for own messages */}
                        {message.senderId === user?.id && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                            title="Delete message"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === user?.id 
                              ? getMessageBubbleAccentColor()
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[60px] resize-none"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Delete Message Confirmation Dialog */}
      <AlertDialog open={isDeleteMessageDialogOpen} onOpenChange={setIsDeleteMessageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMessage}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Conversation Confirmation Dialog */}
      <AlertDialog open={isDeleteConversationDialogOpen} onOpenChange={setIsDeleteConversationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entire conversation? This will permanently delete all
              messages and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
