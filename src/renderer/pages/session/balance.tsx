import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/renderer/components/ui/use-toast'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/ui/button'
import { Label } from '@/renderer/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/renderer/components/ui/card'
import { useBalanceStore } from '@/renderer/lib/stores/balance-store'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'

export function BalancePage() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addBalance } = useBalanceStore()
  const { customer } = useCustomerAuthStore()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
      })
      return
    }

    try {
      if (!customer) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No customer found',
        })
        return
      }

      setLoading(true)
      await addBalance(customer.id, parseFloat(amount))
      toast({
        title: 'Success',
        description: 'Balance added successfully',
      })
      navigate('/app/session')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Add Balance</CardTitle>
          <CardDescription>Add money to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Balance'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
