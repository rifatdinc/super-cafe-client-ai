import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/ui/button'
import { Label } from '@/renderer/components/ui/label'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { Wallet } from 'lucide-react'
import { supabase } from '@/renderer/lib/supabase'
import { LoadingSpinner } from '@/renderer/components/ui/loading'

interface LoginForm {
  email: string
  password: string
}

export function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: 'mr.dinc41@gmail.com',
    password: 'rafi41',
  })
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const navigate = useNavigate()
  const { signIn } = useCustomerAuthStore()

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        // Önce auth session'ı kontrol et
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Aktif oturum var mı kontrol et
          const { data: activeSession } = await supabase
            .from('sessions')
            .select('*')
            .eq('customer_id', session.user.id)
            .eq('status', 'active')
            .is('end_time', null)
            .maybeSingle()

          if (activeSession) {
            navigate('/app/dashboard')
            return
          }
        }
      } catch (error) {
        console.error('Active session check error:', error)
      } finally {
        setCheckingSession(false)
      }
    }

    checkActiveSession()
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Lütfen tüm alanları doldurun')
      return
    }

    try {
      setLoading(true)
      
      // Aktif session kontrolü
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (authSession?.user) {
        const { data: activeSession } = await supabase
          .from('sessions')
          .select('*')
          .eq('customer_id', authSession.user.id)
          .eq('status', 'active')
          .is('end_time', null)
          .maybeSingle()

        if (activeSession) {
          navigate('/app/dashboard')
          return
        }
      }

      const result = await signIn(formData.email, formData.password)
      
      if (!result?.success) {
        const isBalanceError = result?.type === 'balance'
        if (isBalanceError) {
          toast.error(
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-medium">Bakiyeniz Tükendi! 😅</p>
                <p className="mt-1 text-sm opacity-90">
                  <Link to="/add-balance" className="text-blue-500 hover:underline">
                    Buraya tıklayarak
                  </Link>
                  {' '}bakiye yükleyebilir ve oyunun keyfini çıkarabilirsiniz! 🎮
                </p>
              </div>
            </div>,
            {
              duration: 6000
            }
          )
        } else {
          toast.error(result?.error || 'Giriş yapılırken bir hata oluştu')
        }
        return
      }

      toast.success('Hoş geldiniz! Keyifli oyunlar 🎮', {
        description: 'Başarıyla giriş yapıldı'
      })
      navigate('/app/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return <LoadingSpinner />
  }

  return (
    <div className="relative flex h-screen items-center justify-center px-4 overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover -z-10"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/placeholder.mp4" type="video/mp4" />
      </video>
      <div className="w-full max-w-md space-y-8 rounded-lg border border-white/10 bg-black/30 p-6 shadow-lg backdrop-blur-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Welcome to Super Cafe
          </h2>
          <p className="mt-2 text-center text-sm text-white/70">
            Sign in to your customer account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <div className="text-center text-sm text-white/70">
            First time here?{' '}
            <Button
              variant="link"
              className="p-0 text-white hover:text-white/80"
              onClick={() => navigate('/signup')}
            >
              Create account
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
