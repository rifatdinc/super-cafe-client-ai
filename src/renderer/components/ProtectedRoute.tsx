import { Navigate, useLocation } from 'react-router-dom'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useCustomerAuthStore()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
