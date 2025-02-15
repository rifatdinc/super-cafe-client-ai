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
  const { 
    currentSession, 
    startSession, 
    endSession, 
    fetchCurrentSession, 
    loading,
    calculateCurrentCost,
    MINIMUM_FEE,
    HOURLY_RATE
  } = useSessionStore()
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

  const getCurrentCost = () => {
    const minutesElapsed = Math.ceil(elapsedTime / 60)
    return calculateCurrentCost(minutesElapsed)
  }

  const handleStartSession = async () => {
    try {
      if (balance < MINIMUM_FEE) {
        toast({
          variant: 'destructive',
          title: 'Yetersiz Bakiye',
          description: `Minimum açılış ücreti ${MINIMUM_FEE} TL'dir. Lütfen bakiye yükleyin.`,
        })
        navigate('/app/session/balance')
        return
      }

      await startSession('COMPUTER-1', customer.id)
      toast({
        title: 'Oturum Başlatıldı',
        description: `Minimum açılış ücreti: ${MINIMUM_FEE} TL, Saatlik ücret: ${HOURLY_RATE} TL`,
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.message,
      })
    }
  }

  const handleEndSession = async () => {
    try {
      await endSession()
      toast({
        title: 'Session Ended',
        description: 'Your session has been ended successfully',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Oturum Yönetimi</CardTitle>
          <CardDescription>
            Mevcut Bakiye: ₺{balance.toFixed(2)}
            {!currentSession && (
              <div className="mt-2 text-sm text-muted-foreground">
                Minimum açılış ücreti: ₺{MINIMUM_FEE} • Saatlik ücret: ₺{HOURLY_RATE}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentSession ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold">{formatTime(elapsedTime)}</h3>
                <p className="text-sm text-muted-foreground">Geçen Süre</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold">₺{getCurrentCost()}</h3>
                <p className="text-sm text-muted-foreground">Mevcut Ücret</p>
              </div>
              <Button 
                className="w-full" 
                variant="destructive"
                onClick={handleEndSession}
                disabled={loading}
              >
                Oturumu Sonlandır
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                className="w-full" 
                onClick={handleStartSession}
                disabled={loading || balance < MINIMUM_FEE}
              >
                Yeni Oturum Başlat
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/app/session/balance')}
              >
                Bakiye Yükle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
