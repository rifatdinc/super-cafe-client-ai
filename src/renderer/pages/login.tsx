import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/renderer/components/ui/use-toast'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/ui/button'
import { Label } from '@/renderer/components/ui/label'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'

interface LoginForm {
  email: string
  password: string
}

export function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signIn } = useCustomerAuthStore()

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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields',
      })
      return
    }

    try {
      setLoading(true)
      await signIn(formData.email, formData.password)
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      })
      navigate('/app/dashboard')
    } catch (error) {
      let errorMessage = 'An error occurred while signing in.'
      if (error instanceof Error) {
        if (error.message.includes('No customer account found')) {
          errorMessage = 'No customer account found. Please contact staff to create your account.'
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password.'
        } else {
          errorMessage = error.message
        }
      }
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
