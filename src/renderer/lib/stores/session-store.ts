import { create } from 'zustand'
import { supabase } from '../supabase'

interface Session {
  id: string
  computerId: string
  customerId: string
  startTime: string
  endTime: string | null
  duration: number | null
  hourlyRate: number
  totalCost: number | null
  status: 'active' | 'ended'
}

interface SessionStore {
  currentSession: Session | null
  loading: boolean
  error: string | null
  startSession: (computerId: string, customerId: string) => Promise<void>
  endSession: () => Promise<void>
  fetchCurrentSession: (customerId: string) => Promise<void>
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentSession: null,
  loading: false,
  error: null,

  startSession: async (computerId: string, customerId: string) => {
    set({ loading: true, error: null })
    try {
      // First check if there's enough balance
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'minimum_balance')
        .single()

      if (!settings) throw new Error('Minimum balance setting not found')

      const { data: customer } = await supabase
        .from('customers')
        .select('balance')
        .eq('id', customerId)
        .single()

      if (!customer) throw new Error('Customer not found')

      const minBalance = settings.value.amount
      if (customer.balance < minBalance) {
        throw new Error(`Insufficient balance. Minimum required: ${minBalance}`)
      }

      // Get hourly rate
      const { data: rateSettings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'hourly_rate')
        .single()

      if (!rateSettings) throw new Error('Hourly rate setting not found')

      // Start session
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          computer_id: computerId,
          customer_id: customerId,
          hourly_rate: rateSettings.value.amount,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      set({ currentSession: session as Session })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An unknown error occurred' })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  endSession: async () => {
    set({ loading: true, error: null })
    try {
      const currentSession = get().currentSession
      if (!currentSession) throw new Error('No active session')

      const endTime = new Date().toISOString()
      const duration = Math.ceil((new Date(endTime).getTime() - new Date(currentSession.startTime).getTime()) / (1000 * 60))
      const totalCost = (duration / 60) * currentSession.hourlyRate

      const { error } = await supabase
        .from('sessions')
        .update({
          end_time: endTime,
          duration,
          total_cost: totalCost,
          status: 'ended'
        })
        .eq('id', currentSession.id)

      if (error) throw error

      // Subtract balance
      await supabase.rpc('subtract_customer_balance', {
        p_customer_id: currentSession.customerId,
        p_amount: totalCost
      })

      set({ currentSession: null })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An unknown error occurred' })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  fetchCurrentSession: async (customerId: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
      set({ currentSession: data as Session })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An unknown error occurred' })
    } finally {
      set({ loading: false })
    }
  }
}))
