import { Navigate } from 'react-router-dom'
import { useCustomerAuthStore } from '../lib/stores/customer-auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session } = useCustomerAuthStore()

  if (!session) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}
