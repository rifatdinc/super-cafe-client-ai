import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { Button } from '@/renderer/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const { user, customer, signOut } = useCustomerAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {customer?.full_name}</h1>
        <div className="mt-4 space-y-2">
          <p className="text-muted-foreground">Email: {user?.email}</p>
          <p className="text-muted-foreground">Phone: {customer?.phone}</p>
          <p className="text-muted-foreground">Balance: ${customer?.balance}</p>
        </div>
      </div>

      <Button variant="outline" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  )
}
