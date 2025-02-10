import { Navigate, useLocation } from 'react-router-dom'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { LoadingSpinner } from '@/renderer/components/ui/loading'

interface CustomerProtectedRouteProps {
  children: React.ReactNode
}

export const CustomerProtectedRoute = ({ children }: CustomerProtectedRouteProps) => {
  const { session, customer } = useCustomerAuthStore()
  const location = useLocation()

  // If we're still checking auth status, show loading
  if (session && !customer) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // If no session or no customer data, redirect to login
  if (!session || !customer) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
