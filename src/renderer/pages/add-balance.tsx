import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/ui/button'
import { Label } from '@/renderer/components/ui/label'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { useBalanceStore } from '@/renderer/lib/stores/balance-store'
import { ArrowLeft, X, Wallet, Sparkles, MonitorPlay } from 'lucide-react'
import { motion } from 'framer-motion'

const BALANCE_OPTIONS = [
  { amount: 50, label: '50 ₺', icon: '🎮', description: '2 saat oyun keyfi!' },
  { amount: 100, label: '100 ₺', icon: '🖥️', description: '5 saat gaming deneyimi!' },
  { amount: 200, label: '200 ₺', icon: '🎯', description: '12 saat sınırsız eğlence!' },
  { amount: 500, label: '500 ₺', icon: '🏆', description: 'VIP gaming deneyimi!' }
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
          <div className="w-[70px]" />
          
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
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <div className="relative">
                <Wallet className="h-16 w-16 text-primary" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold">Bakiye Yükle</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <MonitorPlay className="h-5 w-5 text-primary" />
              <p className="text-muted-foreground">
                Mevcut Bakiye: <span className="font-bold text-primary">₺{balance}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {BALANCE_OPTIONS.map((option, index) => (
              <motion.div
                key={option.amount}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={selectedAmount === option.amount ? "default" : "outline"}
                  className="h-28 w-full flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
                  onClick={() => setSelectedAmount(option.amount)}
                >
                  <motion.div
                    animate={{ 
                      y: selectedAmount === option.amount ? [0, -5, 0] : 0 
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl"
                  >
                    {option.icon}
                  </motion.div>
                  <span className="text-lg font-bold">{option.label}</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    {option.description}
                  </span>
                  {selectedAmount === option.amount && (
                    <motion.div
                      layoutId="selectedIndicator"
                      className="absolute inset-0 border-2 border-primary rounded-lg"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Label>Özel Miktar</Label>
            <Input
              type="number"
              min="1"
              placeholder="Miktar giriniz"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(Number(e.target.value))}
              className="text-lg"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full relative" 
              size="lg"
              onClick={handleAddBalance}
              disabled={loading || selectedAmount <= 0}
            >
              <span className="flex items-center gap-2">
                {loading ? (
                  'İşleniyor...'
                ) : (
                  <>
                    <span>{selectedAmount} ₺ Yükle</span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                  </>
                )}
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
