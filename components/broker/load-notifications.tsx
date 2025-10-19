"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, TrendingUp, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Negotiation {
  id: string
  load_id: string
  negotiator_name: string
  negotiator_company: string
  negotiator_role: string
  original_rate: number
  counter_offer: number
  message: string
  status: string
  created_at: string
}

interface Acceptance {
  id: string
  load_id: string
  accepted_by_name: string
  accepted_by_company: string
  accepted_by_role: string
  accepted_by_phone: string  
  accepted_by_mc_number: string  
  accepted_rate: number
  accepted_at: string
  approval_status: string
}

export function LoadNotifications() {
  const { user } = useAuth()
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [acceptances, setAcceptances] = useState<Acceptance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      // Fetch negotiations
      const negResponse = await fetch(`/api/loads/negotiate?brokerId=${user.id}`)
      if (negResponse.ok) {
        const negData = await negResponse.json()
        setNegotiations(negData.negotiations)
      }

      // Fetch acceptances
      const accResponse = await fetch(`/api/loads/accept?brokerId=${user.id}`)
      if (accResponse.ok) {
        const accData = await accResponse.json()
        setAcceptances(accData.acceptances)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveAcceptance = async (acceptanceId: string, action: 'approve' | 'decline') => {
    if (!user) return
    
    const confirmMessage = action === 'approve' 
      ? 'Approve this carrier for the load?' 
      : 'Decline this acceptance request?'
    
    if (!confirm(confirmMessage)) return
    
    try {
      const response = await fetch('/api/loads/approve-acceptance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acceptanceId,
          brokerId: user.id,
          action
        })
      })
      
      if (response.ok) {
        alert(action === 'approve' ? 'Acceptance approved! Load is now booked.' : 'Acceptance declined.')
        fetchNotifications() // Refresh the list
      } else {
        alert('Failed to process request')
      }
    } catch (error) {
      console.error('Error processing approval:', error)
      alert('An error occurred')
    }
  }

  const unreadCount = negotiations.filter(n => n.status === 'pending').length + 
                      acceptances.filter(a => a.approval_status === 'pending').length

  if (isLoading) {
    return <div>Loading notifications...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Load Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </div>
        <Button variant="outline" onClick={fetchNotifications}>
          Refresh
        </Button>
      </div>

      {/* Negotiations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Negotiation Requests ({negotiations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {negotiations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No negotiation requests</p>
            ) : (
              negotiations.map((neg) => (
                <div key={neg.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{neg.negotiator_company}</h4>
                        <Badge variant="outline">{neg.negotiator_role}</Badge>
                        <Badge className={neg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}>
                          {neg.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Load: {neg.load_id}</p>
                      <p className="text-sm text-gray-600">Contact: {neg.negotiator_name}</p>
                      {neg.message && (
                        <p className="text-sm text-gray-700 mt-2 italic">"{neg.message}"</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">
                        Original: ${neg.original_rate.toLocaleString()}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ${neg.counter_offer.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(neg.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {neg.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        Counter Offer
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600">
                        Accept
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1">
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Acceptances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Load Acceptance Requests ({acceptances.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {acceptances.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No acceptance requests</p>
            ) : (
              acceptances.map((acc) => (
                <div key={acc.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{acc.accepted_by_company}</h4>
                        <Badge variant="outline">{acc.accepted_by_role}</Badge>
                        <Badge className={
                          acc.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                          acc.approval_status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {acc.approval_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Load: {acc.load_id}</p>
                      <p className="text-sm text-gray-600">Contact: {acc.accepted_by_name}</p>
                      <p className="text-sm text-gray-600">Phone: {acc.accepted_by_phone}</p>  
                      <p className="text-sm text-gray-600">MC Number: {acc.accepted_by_mc_number}</p>  
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${acc.accepted_rate.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(acc.accepted_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {acc.approval_status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveAcceptance(acc.id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => handleApproveAcceptance(acc.id, 'decline')}
                      >
                        Decline
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Message
                      </Button>
                    </div>
                  )}
                  
                  {acc.approval_status === 'approved' && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600">
                        Message
                      </Button>
                    </div>
                  )}

                  {acc.approval_status === 'declined' && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1" disabled>
                        Declined
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}