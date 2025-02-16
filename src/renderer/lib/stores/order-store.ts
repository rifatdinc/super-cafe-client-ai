import { create } from 'zustand'
import { supabase } from '../supabase'
import type { Order, OrderItem, Product } from '../../../types/database.types'
import { useCustomerAuthStore } from './customer-auth-store'

interface CartItem extends Product {
  quantity: number
}

interface OrderState {
  orders: Order[]
  cart: CartItem[]
  isLoading: boolean
  error: string | null

  // Cart operations
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateCartItemQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number

  // Order operations
  placeOrder: (notes?: string) => Promise<void>
  fetchUserOrders: () => Promise<void>

  // State management
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  cart: [],
  isLoading: false,
  error: null,

  addToCart: (product: Product, quantity: number) => {
    set((state) => {
      const existingItem = state.cart.find(item => item.id === product.id)
      
      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
      }
      
      return {
        cart: [...state.cart, { ...product, quantity }]
      }
    })
  },

  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter(item => item.id !== productId)
    }))
  },

  updateCartItemQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }

    set((state) => ({
      cart: state.cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    }))
  },

  clearCart: () => {
    set({ cart: [] })
  },

  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  },

  placeOrder: async (notes?: string) => {
    try {
      set({ isLoading: true, error: null })
      const customer = useCustomerAuthStore.getState().customer
      
      if (!customer?.id) {
        throw new Error('User not authenticated')
      }

      const cart = get().cart
      if (cart.length === 0) {
        throw new Error('Cart is empty')
      }

      const total_amount = get().getCartTotal()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: customer.id,
            total_amount,
            status: 'preparing',
            payment_status: 'unpaid',
            notes
          }
        ])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Process payment
      await supabase.rpc('subtract_customer_balance', {
        p_customer_id: customer.id,
        p_amount: total_amount
      })

      // Clear cart after successful order
      get().clearCart()
      
      // Refresh orders list
      await get().fetchUserOrders()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUserOrders: async () => {
    try {
      set({ isLoading: true, error: null })
      const customer = useCustomerAuthStore.getState().customer
      
      if (!customer?.id) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              price,
              description,
              image_url
            )
          )
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ orders: data || [] })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error })
}))