import { useEffect } from 'react'
import { useOrderStore } from '../lib/stores/order-store'
import { LoadingSpinner } from '../components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

export function OrderHistoryPage() {
  const { t } = useTranslation()
  const { orders, isLoading, error, fetchUserOrders } = useOrderStore()

  useEffect(() => {
    fetchUserOrders()
  }, [fetchUserOrders])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('orders.history')}</h1>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('orders.noOrders')}
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>#{order.id.slice(0, 8)}</span>
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'destructive'}>
                      {order.payment_status}
                    </Badge>
                  </div>
                  <span className="text-base font-normal">
                    {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{item.products?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₺{item.unit_price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">₺{item.total_price.toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold">{t('orders.total')}</span>
                    <span className="font-bold">₺{order.total_amount.toFixed(2)}</span>
                  </div>
                  {order.notes && (
                    <div className="mt-4 p-2 bg-muted rounded-md">
                      <p className="text-sm font-medium">{t('orders.notes')}:</p>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}