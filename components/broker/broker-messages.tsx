"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarInitials } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Search, Phone, Mail, Package, Trash2 } from "lucide-react"
import { useMessagingStore } from "@/lib/messaging-store"
import { useAuth } from "@/lib/auth-context"

export function BrokerMessages() {
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
  const [filterType, setFilterType] = useState<"all" | "unread" | "carriers" | "dispatchers">("all")

  // Fetch conversations on mount
  useEffect(() => {
    console.log('🔍 Messages tab mounted, user:', user)
    if (user) {
      console.log('📞 Fetching conversations for user:', user.id)
      fetchConversations(user.id)
    } else {
      console.log('❌ No user found')
    }
  }, [user, fetchConversations])

  // Get conversations for current user
  const conversations = user ? getConversationsForUser(user.id) : []

  // Log conversations when they change
  useEffect(() => {
    console.log('📊 Conversations loaded:', conversations.length, conversations)
  }, [conversations])

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId)
    }
  }, [selectedConversationId, fetchMessages])

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
      (filterType === "carriers" && otherParticipant.role === "carrier") ||
      (filterType === "dispatchers" && otherParticipant.role === "dispatcher")

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
      senderRole: user.role as "broker",
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

  const handleDeleteMessage = async (messageId: string) => {
    if (!user || !selectedConversationId) return

    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      await deleteMessage(messageId, selectedConversationId, user.id)
    } catch (error) {
      alert('Failed to delete message. You can only delete your own messages.')
    }
  }
//delete conversation

  const handleDeleteConversation = async (conversationId: string) => {
    if (!user) return

    if (!confirm('Are you sure you want to delete this entire conversation? This cannot be undone.')) return

    try {
      await deleteConversation(conversationId, user.id)
      // Clear selection if the deleted conversation was selected
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null)
      }
    } catch (error) {
      alert('Failed to delete conversation.')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-600">Communicate with carriers and dispatchers</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread</Badge>
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
              <div className="flex gap-1">
                {["all", "unread", "carriers", "dispatchers"].map((filter) => (
                  <Button
                    key={filter}
                    variant={filterType === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(filter as any)}
                    className="text-xs"
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filteredConversations.map((conversation) => {
                const otherParticipant = conversation.participants.find((p) => p.id !== user?.id)
                if (!otherParticipant) return null

                return (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b transition-colors relative group ${
                      selectedConversationId === conversation.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Delete button - appears on hover */}
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
                    
                    <div onClick={() => handleSelectConversation(conversation.id)} className="cursor-pointer">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarInitials name={otherParticipant.name} />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {otherParticipant.name}
                              {otherParticipant.mcNumber && (
                                <span className="text-xs text-gray-500 ml-1">({otherParticipant.mcNumber})</span>
                              )}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(otherParticipant.role)}>{otherParticipant.role}</Badge>
                            <span className="text-xs text-gray-600 truncate">{otherParticipant.company}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-1">{conversation.lastMessage}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">{formatTime(conversation.lastMessageTime)}</span>
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
              })}
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
                      const otherParticipant = selectedConversation.participants.find((p) => p.id !== user?.id)
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
                                <span className="text-sm text-gray-500 ml-2">({otherParticipant.mcNumber})</span>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Badge className={getRoleColor(otherParticipant.role)}>{otherParticipant.role}</Badge>
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
                    className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"} group`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg relative ${
                        message.senderId === user?.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {/* Delete button - only show for own messages */}
                      {message.senderId === user?.id && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Delete message"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${message.senderId === user?.id ? "text-blue-100" : "text-gray-500"}`}
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
    </div>
  )
}