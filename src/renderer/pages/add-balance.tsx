import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/ui/button'
import { Label } from '@/renderer/components/ui/label'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { useBalanceStore } from '@/renderer/lib/stores/balance-store'
import { ArrowLeft, X } from 'lucide-react'

const BALANCE_OPTIONS = [
  { amount: 50, label: '50 ₺' },
  { amount: 100, label: '100 ₺' },
  { amount: 200, label: '200 ₺' },
  { amount: 500, label: '500 ₺' }
]

export function AddBalancePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { customer } = useCustomerAuthStore()
  const { addBalance, balance, fetchBalance } = useBalanceStore()

  useEffect(() => {
    if (customer?.id) {
      fetchBalance(customer.id)
    }
  }, [customer?.id])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate(-1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const handleAddBalance = async () => {
    if (!customer?.id) {
      toast.error('Kullanıcı bilgisi bulunamadı')
      return
    }

    try {
      setLoading(true)
      await addBalance(customer.id, selectedAmount)
      
      toast.success('Bakiye yükleme başarılı! 🎉', {
        description: `Hesabınıza ${selectedAmount} ₺ yüklendi.`
      })
      navigate('/app/dashboard')
    } catch (error) {
      toast.error('Bakiye yüklenirken bir hata oluştu')
      console.error('Error adding balance:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Small TopBar */}
      <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center px-4" style={{ WebkitAppRegion: 'drag' }}>
          {/* macOS window controls için boşluk */}
          <div className="w-[70px]" style={{ WebkitAppRegion: 'drag' }}/>
          
          <div className="flex-1 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Geri Dön</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-accent rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-md mx-auto py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Bakiye Yükle</h2>
            <p className="text-muted-foreground mt-1">
              Mevcut Bakiye: {balance} ₺
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {BALANCE_OPTIONS.map((option) => (
              <Button
                key={option.amount}
                variant={selectedAmount === option.amount ? "default" : "outline"}
                className="h-20 text-lg"
                onClick={() => setSelectedAmount(option.amount)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Özel Miktar</Label>
            <Input
              type="number"
              min="1"
              placeholder="Miktar giriniz"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(Number(e.target.value))}
            />
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleAddBalance}
            disabled={loading || selectedAmount <= 0}
          >
            {loading ? 'İşleniyor...' : `${selectedAmount} ₺ Yükle`}
          </Button>
        </div>
      </div>
    </div>
  )
}
