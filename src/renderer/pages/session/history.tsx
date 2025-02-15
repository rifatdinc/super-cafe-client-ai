import { useEffect, useState } from 'react'
import { supabase } from '@/renderer/lib/supabase'
import { format } from 'date-fns'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/renderer/components/ui/table'

type PaymentStatus = 'paid' | 'unpaid'
type SessionStatus = 'active' | 'completed' | 'cancelled'

interface Session {
  id: string
  computer_id: string
  customer_id: string
  start_time: string
  end_time: string | null
  duration: number | null
  hourly_rate: number
  total_cost: number | null
  payment_status: PaymentStatus
  status: SessionStatus
  notes: string | null
  created_at: string
  updated_at: string
}

interface Column {
  header: string
  accessorKey: keyof Session
  cell: (value: any) => React.ReactNode
}

export function SessionHistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
      
        const { data, error } = await supabase
          .from('sessions')
          .select(`
            id,
            computer_id,
            customer_id,
            start_time,
            end_time,
            duration,
            hourly_rate,
            total_cost,
            payment_status,
            status,
            notes,
            created_at,
            updated_at
          `)
          .eq('customer_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setSessions(data)
      } catch (error) {
        console.error('Error loading sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [])

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}s ${mins}d`
  }

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'completed': return 'text-blue-500'
      case 'cancelled': return 'text-red-500'
      default: return ''
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    return status === 'paid' ? 'text-green-500' : 'text-yellow-500'
  }

  const columns: Column[] = [
    { 
      header: 'Başlangıç', 
      accessorKey: 'start_time',
      cell: (value: string) => format(new Date(value), 'dd.MM.yyyy HH:mm')
    },
    { 
      header: 'Bitiş', 
      accessorKey: 'end_time',
      cell: (value: string | null) => value ? format(new Date(value), 'dd.MM.yyyy HH:mm') : '-'
    },
    { 
      header: 'Süre (dk)', 
      accessorKey: 'duration',
      cell: (value: number | null) => formatDuration(value)
    },
    { 
      header: 'Saatlik Ücret', 
      accessorKey: 'hourly_rate',
      cell: (value: number) => `${value} ₺`
    },
    { 
      header: 'Toplam', 
      accessorKey: 'total_cost',
      cell: (value: number | null) => value ? `${value} ₺` : '-'
    },
    {
      header: 'Durum',
      accessorKey: 'status',
      cell: (value: SessionStatus) => (
        <span className={getStatusColor(value)}>
          {value === 'active' ? 'Aktif' : value === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
        </span>
      )
    },
    {
      header: 'Ödeme',
      accessorKey: 'payment_status',
      cell: (value: PaymentStatus) => (
        <span className={getPaymentStatusColor(value)}>
          {value === 'paid' ? 'Ödendi' : 'Ödenmedi'}
        </span>
      )
    }
  ]

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Oturum Geçmişi</h1>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Oturum Geçmişi</h1>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.accessorKey} className="font-medium">
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                {columns.map((column) => (
                  <TableCell key={`${session.id}-${column.accessorKey}`}>
                    {column.cell(session[column.accessorKey])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
