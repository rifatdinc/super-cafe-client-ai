import { useNavigate } from 'react-router-dom'
import { Button } from '@/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/renderer/components/ui/card'
import { useBalanceStore } from '@/renderer/lib/stores/balance-store'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { useEffect } from 'react'
import { TextShimmer } from '@/renderer/components/ui/text-shimmer'

export function DashboardPage() {
  const navigate = useNavigate()
  const { customer, signOut } = useCustomerAuthStore()
  const { balance, loading, fetchBalance } = useBalanceStore()

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

  if (!customer || loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="mb-8 text-center">
          <TextShimmer 
            as="h1" 
            className="text-3xl font-bold"
            duration={1.5}
          >
            Yükleniyor...
          </TextShimmer>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 text-center">
        <TextShimmer 
          as="h1" 
          className="text-3xl font-bold"
        >
          {`Hoşgeldin, ${customer?.full_name}`}
        </TextShimmer>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

      </div>
    </div>
  )
}
