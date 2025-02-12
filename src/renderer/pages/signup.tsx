import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/renderer/components/ui/use-toast'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/ui/button'
import { Label } from '@/renderer/components/ui/label'
import { supabase } from '../lib/supabase'

interface SignupForm {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  phone: string
}

export function SignUpPage() {
  const [formData, setFormData] = useState<SignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.full_name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match',
      })
      return
    }

    try {
      setLoading(true)

      // Kullanıcı kaydı oluştur
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      if (!authData.user) {
        throw new Error('User could not be created')
      }

      toast({
        title: 'Success!',
        description: 'Account created. Please check your email for verification and then log in.',
      })
      
      navigate('/login')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred during signup',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Enter your information to create an account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
            Log in
          </Button>
        </div>
      </div>
    </div>
  )
}
