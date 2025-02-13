import { create } from 'zustand'
import { supabase } from '../supabase'

interface BalanceStore {
  balance: number
  loading: boolean
  fetchBalance: (customerId: string) => Promise<void>
  addBalance: (customerId: string, amount: number) => Promise<void>
}

export const useBalanceStore = create<BalanceStore>((set) => ({
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
      const { data: newBalance } = await supabase
        .from('customers')
        .select('balance')
        .eq('id', customerId)
        .single()

      if (!newBalance) throw new Error('Failed to get updated balance')
      set({ balance: newBalance.balance })
    } catch (error) {
      console.error('Error adding balance:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))
