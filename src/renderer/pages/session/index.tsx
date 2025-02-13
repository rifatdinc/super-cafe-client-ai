import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/renderer/components/ui/use-toast'
import { Button } from '@/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/renderer/components/ui/card'
import { useSessionStore } from '@/renderer/lib/stores/session-store'
import { useBalanceStore } from '@/renderer/lib/stores/balance-store'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'

export function SessionPage() {
  const [elapsedTime, setElapsedTime] = useState(0)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentSession, startSession, endSession, fetchCurrentSession, loading } = useSessionStore()
  const { balance, fetchBalance } = useBalanceStore()
  const { customer } = useCustomerAuthStore()

  useEffect(() => {
    if (customer?.id) {
      fetchCurrentSession(customer.id)
      fetchBalance(customer.id)
    }
  }, [customer?.id])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentSession?.startTime) {
      interval = setInterval(() => {
        const start = new Date(currentSession.startTime).getTime()
        const now = new Date().getTime()
        setElapsedTime(Math.floor((now - start) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentSession?.startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const calculateCurrentCost = () => {
    if (!currentSession) return 0
    const hours = elapsedTime / 3600
    return (hours * currentSession.hourlyRate).toFixed(2)
  }

  const handleStartSession = async () => {
    try {
      if (!customer) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No customer found',
        })
        return
      }

      // For now, we're using a hardcoded computer ID. In reality, this should come from the selected computer
      await startSession('COMPUTER-1', customer.id)
      toast({
        title: 'Session Started',
        description: 'Your session has been started successfully',
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      
      if (error instanceof Error && errorMessage.includes('Insufficient balance')) {
        toast({
          variant: 'destructive',
          title: 'Insufficient Balance',
          description: 'Please add more balance to start a session',
        })
        navigate('/app/session/balance')
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        })
      }
    }
  }

  const handleEndSession = async () => {
    try {
      await endSession()
      toast({
        title: 'Session Ended',
        description: 'Your session has been ended successfully',
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Current Balance: ₺{balance.toFixed(2)}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentSession ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold">{formatTime(elapsedTime)}</h3>
                <p className="text-sm text-muted-foreground">Elapsed Time</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold">₺{calculateCurrentCost()}</h3>
                <p className="text-sm text-muted-foreground">Current Cost</p>
              </div>
              <Button 
                className="w-full" 
                variant="destructive"
                onClick={handleEndSession}
                disabled={loading}
              >
                End Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                className="w-full" 
                onClick={handleStartSession}
                disabled={loading}
              >
                Start New Session
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/app/session/balance')}
              >
                Add Balance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
