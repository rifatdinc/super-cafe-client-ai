import { useEffect, useState } from 'react'
import { useOrderStore } from '../lib/stores/order-store'
import { useProductStore } from '../lib/stores/product-store'
import { useCustomerAuthStore } from '../lib/stores/customer-auth-store'
import { useBalanceStore } from '../lib/stores/balance-store'
import { useToast } from '../components/ui/use-toast'
import { LoadingSpinner } from '../components/ui/loading'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import ReactConfetti from 'react-confetti'
import { CartDialog } from './cart-dialog'

export function OrderPage() {
  const { t } = useTranslation()
  const [showConfetti, setShowConfetti] = useState(false)
  const { customer } = useCustomerAuthStore()
  const { updateBalanceAfterOrder } = useBalanceStore()
  const { 
    cart, 
    isLoading: orderLoading, 
    error: orderError,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotal,
    placeOrder
  } = useOrderStore()

  const {
    categories,
    products,
    selectedCategory,
    isLoading: productLoading,
    error: productError,
    fetchCategories,
    fetchProducts,
    setSelectedCategory
  } = useProductStore()

  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [fetchCategories, fetchProducts])

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('orders.emptyCart')
      })
      return
    }

    try {
      await placeOrder()
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)

      if (customer?.id) {
        await updateBalanceAfterOrder(customer.id)
      }

      toast({
        title: t('orders.orderPlaced'),
        description: t('orders.orderSuccess')
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message
      })
    }
  }

  if (orderLoading || productLoading) {
    return <LoadingSpinner />
  }

  if (orderError || productError) {
    return <div className="p-4 text-destructive">{orderError || productError}</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      {/* Başlık ve Sepet Butonu */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('orders.title')}</h1>
        <CartDialog
          cart={cart}
          removeFromCart={removeFromCart}
          updateCartItemQuantity={updateCartItemQuantity}
          getCartTotal={getCartTotal}
          handlePlaceOrder={handlePlaceOrder}
        />
      </div>

      {/* Kategori Seçimi */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="all" onClick={() => setSelectedCategory(null)}>
            {t('orders.allCategories')}
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Ürün Listesi */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{product.name}</span>
                <span className="text-lg font-bold">₺{product.price.toFixed(2)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              {product.stock_quantity !== null && product.stock_quantity <= 5 && (
                <Badge variant="destructive" className="mr-2">
                  {t('orders.lowStock', { count: product.stock_quantity })}
                </Badge>
              )}
              <Button 
                className="ml-auto" 
                onClick={() => addToCart(product, 1)}
                disabled={product.stock_quantity !== null && product.stock_quantity <= 0}
              >
                {product.stock_quantity !== null && product.stock_quantity <= 0 
                  ? t('orders.outOfStock')
                  : t('orders.addToCart')
                }
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}