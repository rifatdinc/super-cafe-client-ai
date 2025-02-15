import { useNavigate } from 'react-router-dom'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { Bell, User, LogOut } from 'lucide-react'
import { ThemeToggle } from './ui/theme-toggle'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const navigate = useNavigate()
  const { signOut, customer } = useCustomerAuthStore()

  return (
    <div className="fixed top-0 left-16 right-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 cursor-move" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center justify-center cursor-default" style={{ WebkitAppRegion: 'no-drag' }}>
          <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain" />
        </div>

        <div className="flex items-center gap-4 cursor-default" style={{ WebkitAppRegion: 'no-drag' }}>
          <button className="p-2 hover:bg-accent rounded-full">
            <Bell className="h-5 w-5" />
          </button>

          <ThemeToggle />

          <div className="flex items-center gap-2">
            <div className="text-sm text-right">
              <p className="font-medium">{customer?.full_name}</p>
              <p className="text-xs text-muted-foreground">{customer?.email}</p>
            </div>
            <button
              onClick={async () => {
                await signOut()
                navigate('/login')
              }}
              className="p-2 hover:bg-accent rounded-full"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
