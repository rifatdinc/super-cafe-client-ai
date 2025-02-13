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
    email: 'mr.dinc41@gmail.com',
    password: 'rafi41',
    confirmPassword: 'rafi41',
    full_name: 'Rifat dinc',
    phone: '5362561240',
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
    
    if (!formData.email || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields',
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

      if (signUpError) throw signUpError

      // Create customer record with auth_id instead of id
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          auth_id: authData.user?.id,
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          balance: 0
        })

      if (customerError) throw customerError

      toast({
        title: 'Success!',
        description: 'Account created successfully. You can now login.',
      })
      navigate('/login')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Customer Signup
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Create your account with your registered email
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your registered email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0"
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
