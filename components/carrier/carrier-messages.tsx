"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarInitials } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Search, Phone, Mail, Package } from "lucide-react"
import { useMessagingStore } from "@/lib/messaging-store"
import { useAuth } from "@/lib/auth-context"

export function CarrierMessages() {
  const { user } = useAuth()
  const { getConversationsForUser, getMessagesForConversation, addMessage, markAsRead } = useMessagingStore()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "unread" | "brokers" | "dispatchers">("all")

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
      (filterType === "brokers" && otherParticipant.role === "broker") ||
      (filterType === "dispatchers" && otherParticipant.role === "dispatcher")

    return matchesSearch && matchesFilter
  })

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId)
  const conversationMessages = selectedConversationId ? getMessagesForConversation(selectedConversationId) : []

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    const otherParticipant = selectedConversation.participants.find((p) => p.id !== user.id)
    if (!otherParticipant) return

    addMessage({
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: user.role as "carrier",
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

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    if (user) {
      markAsRead(conversationId, user.id)
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
          <p className="text-gray-600">Communicate with brokers and dispatchers</p>
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
                {["all", "unread", "brokers", "dispatchers"].map((filter) => (
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
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                      selectedConversationId === conversation.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
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
                      className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === user?.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
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
