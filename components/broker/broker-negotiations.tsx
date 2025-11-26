"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showToastWithLogo } from "@/components/ui/custom-toasts"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { MapPin, Calendar, Package, DollarSign, User, Building, RefreshCw, MessageSquare, CheckCircle, Clock } from "lucide-react"

interface Negotiation {
  id: string
  load_id: string
  negotiator_id: string
  negotiator_name: string
  negotiator_company: string
  negotiator_role: string
  broker_id: string
  broker_name: string
  broker_company: string
  original_rate: number
  counter_offer: number
  final_rate?: number
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'broker_accepted' | 'final_accepted'
  created_at: string
}

export function BrokerNegotiations() {
  const { user } = useAuth()
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCounterDialogOpen, setIsCounterDialogOpen] = useState(false)
  const [counterOffer, setCounterOffer] = useState("")
  const [counterMessage, setCounterMessage] = useState("")

  useEffect(() => {
    if (user?.id) {
      fetchNegotiations()
    }
  }, [user])

  const fetchNegotiations = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/loads/negotiate?brokerId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setNegotiations(data.negotiations || [])
      }
    } catch (error) {
      console.error('Error fetching negotiations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (negotiation: Negotiation) => {
    if (!confirm(`Accept ${negotiation.negotiator_name}'s offer of $${negotiation.counter_offer.toLocaleString()}?`)) return

    try {
      const response = await fetch('/api/loads/negotiate/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negotiationId: negotiation.id,
          response: 'accepted',
          finalRate: negotiation.counter_offer
        })
      })

      if (response.ok) {
        showToastWithLogo({
          title: "Negotiation Accepted",
          message: `Accepted ${negotiation.negotiator_name}'s offer of $${negotiation.counter_offer.toLocaleString()}. Awaiting their confirmation.`,
          type: 'success'
        })
        fetchNegotiations()
      } else {
        showToastWithLogo({
          title: "Accept Failed",
          message: "Failed to accept negotiation. Please try again.",
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error accepting negotiation:', error)
      showToastWithLogo({
        title: "Error Occurred",
        message: "An error occurred. Please try again.",
        type: 'error'
      })
    }
  }

  const handleReject = async (negotiation: Negotiation) => {
    if (!confirm(`Reject ${negotiation.negotiator_name}'s offer?`)) return

    try {
      const response = await fetch('/api/loads/negotiate/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negotiationId: negotiation.id,
          response: 'rejected'
        })
      })

      if (response.ok) {
        showToastWithLogo({
          title: "Negotiation Rejected",
          message: `Rejected ${negotiation.negotiator_name}'s offer`,
          type: 'info'
        })
        fetchNegotiations()
      } else {
        showToastWithLogo({
          title: "Reject Failed",
          message: "Failed to reject negotiation. Please try again.",
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error rejecting negotiation:', error)
      showToastWithLogo({
        title: "Error Occurred",
        message: "An error occurred. Please try again.",
        type: 'error'
      })
    }
  }

  const handleCounter = (negotiation: Negotiation) => {
    setSelectedNegotiation(negotiation)
    setCounterOffer(negotiation.original_rate.toString())
    setCounterMessage("")
    setIsCounterDialogOpen(true)
  }

  const submitCounterOffer = async () => {
    if (!selectedNegotiation || !counterOffer) return

    try {
      const response = await fetch('/api/loads/negotiate/counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalNegotiationId: selectedNegotiation.id,
          loadId: selectedNegotiation.load_id,
          brokerId: user?.id,
          brokerName: `${user?.firstName} ${user?.lastName}`,
          brokerCompany: user?.companyName,
          negotiatorId: selectedNegotiation.negotiator_id,
          negotiatorName: selectedNegotiation.negotiator_name,
          negotiatorCompany: selectedNegotiation.negotiator_company,
          negotiatorRole: selectedNegotiation.negotiator_role,
          originalRate: selectedNegotiation.original_rate,
          theirOffer: selectedNegotiation.counter_offer,
          myCounterOffer: Number(counterOffer),
          message: counterMessage
        })
      })

      if (response.ok) {
        showToastWithLogo({
          title: "Counter Offer Sent",
          message: `Sent counter offer of $${Number(counterOffer).toLocaleString()} to ${selectedNegotiation.negotiator_name}`,
          type: 'success'
        })
        setIsCounterDialogOpen(false)
        setSelectedNegotiation(null)
        setCounterOffer("")
        setCounterMessage("")
        fetchNegotiations()
      } else {
        showToastWithLogo({
          title: "Counter Failed",
          message: "Failed to send counter offer. Please try again.",
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error sending counter offer:', error)
      showToastWithLogo({
        title: "Error Occurred",
        message: "An error occurred. Please try again.",
        type: 'error'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'broker_accepted': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'final_accepted': return 'bg-green-600 text-white'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'countered': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'broker_accepted': return 'Accepted - Awaiting Carrier Confirmation'
      case 'final_accepted': return '✓ Load Booked'
      default: return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'carrier': return <Package className="h-4 w-4" />
      case 'dispatcher': return <User className="h-4 w-4" />
      default: return <Building className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter out final_accepted negotiations (they're now booked loads)
  const activeNegotiations = negotiations.filter(n => n.status !== 'final_accepted')
  const pendingCount = activeNegotiations.filter(n => n.status === 'pending').length
  const awaitingConfirmation = activeNegotiations.filter(n => n.status === 'broker_accepted').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading negotiations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Negotiations</h1>
          <p className="text-gray-600">
            Manage incoming rate negotiations ({pendingCount} pending{awaitingConfirmation > 0 ? `, ${awaitingConfirmation} awaiting confirmation` : ''})
          </p>
        </div>
        <Button variant="outline" onClick={fetchNegotiations} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {activeNegotiations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No negotiations yet</h3>
            <p className="text-gray-600">
              Rate negotiations from carriers and dispatchers will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeNegotiations.map((negotiation) => (
            <Card key={negotiation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(negotiation.negotiator_role)}
                        <h3 className="text-lg font-semibold">{negotiation.negotiator_name}</h3>
                      </div>
                      <Badge className={getStatusColor(negotiation.status)}>
                        {getStatusText(negotiation.status)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(negotiation.created_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium">{negotiation.negotiator_company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Load ID</p>
                        <p className="font-medium font-mono">{negotiation.load_id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Original Rate</p>
                        <p className="text-xl font-bold text-red-600">
                          ${negotiation.original_rate.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          {negotiation.status === 'broker_accepted' ? 'Agreed Rate' : 'Their Offer'}
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          ${(negotiation.final_rate || negotiation.counter_offer).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Difference</p>
                        <p className={`text-xl font-bold ${
                          (negotiation.final_rate || negotiation.counter_offer) > negotiation.original_rate 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {(negotiation.final_rate || negotiation.counter_offer) > negotiation.original_rate ? '+' : ''}
                          ${((negotiation.final_rate || negotiation.counter_offer) - negotiation.original_rate).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {negotiation.message && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                        <p className="text-sm text-gray-600">{negotiation.message}</p>
                      </div>
                    )}

                    {negotiation.status === 'broker_accepted' && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-medium text-blue-800">
                            Waiting for {negotiation.negotiator_name} to confirm and book this load
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {negotiation.status === 'pending' && (
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleAccept(negotiation)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Accept Offer
                      </Button>
                      <Button
                        onClick={() => handleCounter(negotiation)}
                        variant="outline"
                        size="sm"
                      >
                        Counter Offer
                      </Button>
                      <Button
                        onClick={() => handleReject(negotiation)}
                        variant="destructive"
                        size="sm"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Counter Offer Dialog */}
      <Dialog open={isCounterDialogOpen} onOpenChange={setIsCounterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Counter Offer</DialogTitle>
            <DialogDescription>
              Respond to {selectedNegotiation?.negotiator_name}'s negotiation
            </DialogDescription>
          </DialogHeader>
          {selectedNegotiation && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Negotiation Summary</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">From:</span> {selectedNegotiation.negotiator_name} ({selectedNegotiation.negotiator_company})
                  </div>
                  <div>
                    <span className="font-medium">Load:</span> {selectedNegotiation.load_id}
                  </div>
                  <div>
                    <span className="font-medium">Their Offer:</span> ${selectedNegotiation.counter_offer.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Original Rate</div>
                  <div className="text-xl font-bold text-red-600">
                    ${selectedNegotiation.original_rate.toLocaleString()}
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Your Counter</div>
                  <div className="text-xl font-bold text-blue-600">
                    ${Number(counterOffer || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="counterOffer">Your Counter Offer ($)</Label>
                <Input
                  id="counterOffer"
                  type="number"
                  value={counterOffer}
                  onChange={(e) => setCounterOffer(e.target.value)}
                  placeholder="Enter your counter offer"
                />
              </div>

              <div>
                <Label htmlFor="counterMessage">Message (Optional)</Label>
                <textarea
                  id="counterMessage"
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  className="w-full p-3 border rounded-md resize-none"
                  rows={3}
                  placeholder="Explain your counter offer..."
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  onClick={submitCounterOffer}
                  disabled={!counterOffer || Number(counterOffer) <= 0}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  Send Counter Offer
                </Button>
                <Button
                  onClick={() => setIsCounterDialogOpen(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}