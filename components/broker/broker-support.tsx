"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarInitials } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, HelpCircle, Send } from "lucide-react"
import { supportStore, type SupportTicket } from "@/lib/support-store"

export function BrokerSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false)
  const [newTicketSubject, setNewTicketSubject] = useState("")
  const [newTicketMessage, setNewTicketMessage] = useState("")
  const [newTicketPriority, setNewTicketPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [newResponse, setNewResponse] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Current user info (in a real app, this would come from auth context)
  const currentUser = {
    id: "broker-001",
    name: "Sarah Wilson",
    email: "sarah@logistics.com",
    role: "broker" as const,
  }

  useEffect(() => {
    // Load user's tickets
    loadUserTickets()

    // Listen for ticket updates
    const handleTicketUpdate = () => {
      loadUserTickets()
    }

    window.addEventListener("supportTicketUpdated", handleTicketUpdate)
    window.addEventListener("supportResponseAdded", handleTicketUpdate)
    window.addEventListener("supportTicketAssigned", handleTicketUpdate)

    return () => {
      window.removeEventListener("supportTicketUpdated", handleTicketUpdate)
      window.removeEventListener("supportResponseAdded", handleTicketUpdate)
      window.removeEventListener("supportTicketAssigned", handleTicketUpdate)
    }
  }, [])

  const loadUserTickets = () => {
    const userTickets = supportStore.getUserTickets(currentUser.id)
    setTickets(userTickets)

    // Update selected ticket if it's open
    if (selectedTicket) {
      const updatedTicket = supportStore.getTicketById(selectedTicket.id)
      if (updatedTicket) {
        setSelectedTicket(updatedTicket)
      }
    }
  }

  const handleCreateTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return

    const newTicket = supportStore.createTicket({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      subject: newTicketSubject.trim(),
      message: newTicketMessage.trim(),
      status: "open",
      priority: newTicketPriority,
    })

    setTickets((prev) => [newTicket, ...prev])
    setNewTicketSubject("")
    setNewTicketMessage("")
    setNewTicketPriority("medium")
    setIsNewTicketDialogOpen(false)

    alert("Support ticket created successfully! Our team will respond soon.")
  }

  const handleSendResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return

    supportStore.addResponse(selectedTicket.id, {
      ticketId: selectedTicket.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: "user",
      message: newResponse.trim(),
    })

    setNewResponse("")
    loadUserTickets()
    alert("Response sent successfully!")
  }

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setIsTicketDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-blue-100 text-blue-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <HelpCircle className="h-4 w-4" />
    }
  }

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support Center</h2>
          <p className="text-gray-600">Get help from our support team</p>
        </div>
        <Button onClick={() => setIsNewTicketDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-xl font-bold">{tickets.filter((t) => t.status === "open").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl font-bold">{tickets.filter((t) => t.status === "in_progress").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-xl font-bold">{tickets.filter((t) => t.status === "resolved").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-xl font-bold">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Support Tickets</CardTitle>
              <CardDescription>Track and manage your support requests</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewTicket(ticket)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    {getStatusIcon(ticket.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{ticket.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {ticket.createdAt} • Updated: {ticket.updatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ticket.responses.length > 0 && <Badge variant="outline">{ticket.responses.length} responses</Badge>}
                </div>
              </div>
            ))}
            {filteredTickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No tickets found matching your search." : "No support tickets yet."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Ticket Dialog */}
      <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Support Ticket</DialogTitle>
            <DialogDescription>Describe your issue and our support team will help you resolve it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={newTicketPriority} onValueChange={(value: any) => setNewTicketPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Please provide detailed information about your issue..."
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket} disabled={!newTicketSubject.trim() || !newTicketMessage.trim()}>
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.id} • Created {selectedTicket?.createdAt}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Status */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Priority:</span>
                  <Badge className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                </div>
                {selectedTicket.assignedTo && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Assigned to:</span>
                    <span className="text-sm">{selectedTicket.assignedTo}</span>
                  </div>
                )}
              </div>

              {/* Original Message */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarInitials name={currentUser.name} />
                      </Avatar>
                      <div>
                        <p className="font-medium">You</p>
                        <p className="text-sm text-gray-500">Broker</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{selectedTicket.createdAt}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Responses */}
                {selectedTicket.responses.map((response) => (
                  <div key={response.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarInitials name={response.senderName} />
                        </Avatar>
                        <div>
                          <p className="font-medium">{response.senderName}</p>
                          <p className="text-sm text-gray-500">
                            {response.senderType === "admin" ? "Support Team" : "You"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{response.timestamp}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${response.senderType === "admin" ? "bg-green-50" : "bg-blue-50"}`}>
                      <p className="text-sm">{response.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Form */}
              {selectedTicket.status !== "closed" && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-4">
                    <Label htmlFor="response">Add Response</Label>
                    <Textarea
                      id="response"
                      placeholder="Type your response here..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSendResponse} disabled={!newResponse.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Response
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
