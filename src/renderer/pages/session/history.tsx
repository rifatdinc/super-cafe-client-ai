import { useEffect, useState } from 'react'
import { useToast } from '@/renderer/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/renderer/components/ui/card'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { supabase } from '@/renderer/lib/supabase'

interface SessionHistory {
  id: string
  start_time: string
  end_time: string
  duration: number
  total_cost: number
  computer: {
    computer_number: string
    name: string
  }
}

export function SessionHistoryPage() {
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { customer } = useCustomerAuthStore()

  useEffect(() => {
    if (customer?.id) {
      fetchSessionHistory()
    }
  }, [customer?.id])

  const fetchSessionHistory = async () => {
    setLoading(true)
    try {
      if (!customer) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No customer found',
        })
        return
      }

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          start_time,
          end_time,
          duration,
          total_cost,
          computer:computers (
            computer_number,
            name
          )
        `)
        .eq('customer_id', customer.id)
        .eq('status', 'ended')
        .order('end_time', { ascending: false })
        .limit(10)

      if (error) throw error
      
      // Transform the data to match SessionHistory type
      const transformedData: SessionHistory[] = data.map((session: any) => ({
        id: session.id,
        start_time: session.start_time,
        end_time: session.end_time,
        duration: session.duration,
        total_cost: session.total_cost,
        computer: {
          computer_number: session.computer[0]?.computer_number || '',
          name: session.computer[0]?.name || ''
        }
      }))
      
      setSessions(transformedData)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load session history',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>Your recent sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-4">No session history found</div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Computer</p>
                        <p className="text-sm text-muted-foreground">
                          {session.computer.name || session.computer.computer_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(session.duration)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cost</p>
                        <p className="text-sm text-muted-foreground">
                          ₺{session.total_cost.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.end_time)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
