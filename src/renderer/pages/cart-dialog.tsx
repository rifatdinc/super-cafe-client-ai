import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { ShoppingBagIcon, TrashIcon, MinusIcon, PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '../../types/database.types'


interface CartItem extends Product {
  quantity: number
}

interface CartDialogProps {
  cart: CartItem[]
  removeFromCart: (productId: string) => void
  updateCartItemQuantity: (productId: string, quantity: number) => void
  getCartTotal: () => number
  handlePlaceOrder: () => Promise<void>
}

export function CartDialog({
  cart,
  removeFromCart,
  updateCartItemQuantity,
  getCartTotal,
  handlePlaceOrder
}: CartDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingBagIcon className="w-4 h-4 mr-2" />
          {t('orders.cart')}
          {cart.length > 0 && (
            <Badge variant="secondary" className="absolute -top-2 -right-2">
              {cart.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5" />
            {t('orders.cart')}
            {cart.length > 0 && <Badge variant="secondary">{cart.length}</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {cart.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <ShoppingBagIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {t('orders.emptyCart')}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="sync">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card transition-colors hover:bg-accent/5"
                    >
                      <div className="relative group aspect-square h-16 w-16 overflow-hidden rounded-md">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <ShoppingBagIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium line-clamp-1">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            ₺{item.price.toFixed(2)}
                          </p>
                          <p className="text-sm font-medium">
                            ₺{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value))}
                            className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min={1}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.div
                layout
                className="border-t pt-4 space-y-4"
              >
                <div className="flex items-center justify-between text-lg font-medium">
                  <span>{t('orders.total')}</span>
                  <span>₺{getCartTotal().toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full h-12 text-base relative overflow-hidden group"
                  size="lg"
                  onClick={handlePlaceOrder}
                >
                  <span className="relative z-10">{t('orders.placeOrder')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}