import { useNavigate } from 'react-router-dom'
import { useCustomerAuthStore } from '@/renderer/lib/stores/customer-auth-store'
import { Bell, LogOut, Wallet,UserCircle2 } from 'lucide-react'
import { ThemeToggle } from './ui/theme-toggle'
import { useBalanceStore } from '@/renderer/lib/stores/balance-store'
import { useEffect } from 'react'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const navigate = useNavigate()
  const { signOut, customer } = useCustomerAuthStore()
  const { balance, fetchBalance } = useBalanceStore()

  useEffect(() => {
    if (customer?.id) {
      fetchBalance(customer.id)
    }
  }, [customer?.id])

  return (
    <div className="fixed top-0 left-16 right-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 cursor-move" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center justify-center cursor-default" style={{ WebkitAppRegion: 'no-drag' }}>
        </div>

        <div className="flex items-center gap-4 cursor-default" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => navigate('/add-balance')}
          >
            <Wallet className="h-5 w-5" />
            <span className="font-medium">₺{balance.toFixed(2)}</span>
          </button>

          <button className="p-2 hover:bg-accent rounded-full">
            <Bell className="h-5 w-5" />
          </button>

          <ThemeToggle />
              <button
                onClick={() => navigate('/app/profile')}
                className="p-2 hover:bg-accent rounded-full"
                title="Profil"
              >
                <UserCircle2 className="h-5 w-5" />
              </button>
          <div className="flex items-center gap-2">
            <div className="text-sm text-right">
              <p className="font-medium">{customer?.full_name}</p>
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
