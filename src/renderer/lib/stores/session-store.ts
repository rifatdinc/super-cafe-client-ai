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
  status: 'active' | 'completed' | 'cancelled'
}

interface SessionStore {
  currentSession: Session | null
  loading: boolean
  error: string | null
  startSession: (computerId: string, customerId: string) => Promise<void>
  endSession: () => Promise<void>
  fetchCurrentSession: (customerId: string) => Promise<void>
  calculateCurrentCost: (elapsedTime: number) => number
  MINIMUM_FEE: number
  HOURLY_RATE: number
  BILLING_INTERVAL: number
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentSession: null,
  loading: false,
  error: null,
  MINIMUM_FEE: 30,
  HOURLY_RATE: 60,
  BILLING_INTERVAL: 30,

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
          status: 'active',
          total_cost: get().MINIMUM_FEE
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
      const totalCost = get().calculateCurrentCost(duration)

      const { error } = await supabase
        .from('sessions')
        .update({
          end_time: endTime,
          duration,
          total_cost: totalCost,
          status: 'completed'
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
  },

  calculateCurrentCost: (elapsedMinutes: number) => {
    const { MINIMUM_FEE, HOURLY_RATE, BILLING_INTERVAL } = get()
    
    // Minimum ücret kontrolü
    if (elapsedMinutes <= BILLING_INTERVAL) {
      return MINIMUM_FEE
    }
    
    // 30 dakikalık dilimlere göre ücretlendirme
    const intervals = Math.ceil(elapsedMinutes / BILLING_INTERVAL)
    const cost = Math.max(
      MINIMUM_FEE,
      (intervals * (HOURLY_RATE / 2)) // Her 30 dakika için saatlik ücretin yarısı
    )
    
    return Number(cost.toFixed(2))
  }
}))
