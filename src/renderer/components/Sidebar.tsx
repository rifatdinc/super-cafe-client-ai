import { NavLink, useNavigate } from 'react-router-dom'
import { Home, User, Clock, CreditCard, Settings, LogOut } from 'lucide-react'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'

export function Sidebar() {
  const navigate = useNavigate()
  const { signOut } = useCustomerAuthStore()

  const navItems = [
    { icon: Home, path: '/app/dashboard', label: 'Dashboard' },
    { icon: User, path: '/app/profile', label: 'Profile' },
    { icon: Clock, path: '/app/sessions', label: 'Sessions' },
    { icon: CreditCard, path: '/app/balance', label: 'Balance' },
    { icon: Settings, path: '/app/settings', label: 'Settings' },
  ]

  return (
    <div className="fixed top-0 left-0 bottom-0 w-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r z-50">
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center justify-center border-b">
          <span className="font-semibold">🔥</span>
        </div>

        <div className="flex flex-col items-center py-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `p-3 mb-2 rounded-lg hover:bg-accent transition-colors flex items-center ${
                  isActive ? 'bg-accent' : ''
                }`
              }
            >
              <item.icon className="h-5 w-5" />
            </NavLink>
          ))}

          <button
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
            className="p-3 mt-auto hover:bg-accent rounded-lg flex items-center"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
