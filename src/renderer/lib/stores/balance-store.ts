import { create } from 'zustand'
import { supabase } from '../supabase'

interface BalanceStore {
  balance: number
  loading: boolean
  fetchBalance: (customerId: string) => Promise<void>
  addBalance: (customerId: string, amount: number) => Promise<void>
  subtractBalance: (customerId: string, amount: number) => Promise<void>
  updateBalanceAfterOrder: (customerId: string) => Promise<void>
}

export const useBalanceStore = create<BalanceStore>((set, get) => ({
  balance: 0,
  loading: false,

  fetchBalance: async (customerId: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('balance')
        .eq('id', customerId)
        .single()
      if (error) throw error
      set({ balance: data.balance })
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      set({ loading: false })
    }
  },

  addBalance: async (customerId: string, amount: number) => {
    set({ loading: true })
    try {
      const { error } = await supabase.rpc('add_customer_balance', {
        p_customer_id: customerId,
        p_amount: amount
      })
      if (error) throw error
      
      // Refresh balance after adding
      await get().fetchBalance(customerId)
    } catch (error) {
      console.error('Error adding balance:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  subtractBalance: async (customerId: string, amount: number) => {
    set({ loading: true })
    try {
      const { error } = await supabase.rpc('subtract_customer_balance', {
        p_customer_id: customerId,
        p_amount: amount
      })
      if (error) throw error
      
      // Refresh balance after subtracting
      await get().fetchBalance(customerId)
    } catch (error) {
      console.error('Error subtracting balance:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateBalanceAfterOrder: async (customerId: string) => {
    try {
      await get().fetchBalance(customerId)
    } catch (error) {
      console.error('Error updating balance after order:', error)
    }
  }
}))
