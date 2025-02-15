import { useNavigate } from 'react-router-dom'
import { Button } from '@/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/renderer/components/ui/card'
import { useBalanceStore } from '@/renderer/lib/stores/balance-store'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { useEffect } from 'react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { customer, signOut } = useCustomerAuthStore()
  const { balance, fetchBalance } = useBalanceStore()

  useEffect(() => {
    if (customer?.id) {
      fetchBalance(customer.id)
    }
  }, [customer?.id])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>Start or manage your computer session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">₺{balance.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <Button className="w-full" onClick={() => navigate('/app/session')}>
              Manage Session
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Balance</CardTitle>
            <CardDescription>Top up your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => navigate('/app/session/balance')}>
              Add Balance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>View your past sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => navigate('/app/session/history')}>
              View History
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>View your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer?.full_name}</div>
            <p className="text-sm text-muted-foreground">Email: {customer?.email}</p>
            <p className="text-sm text-muted-foreground">Phone: {customer?.phone}</p>
            <Button className="w-full" variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
