import { create } from 'zustand'
import { supabase } from '../supabase'
import { Session, User } from '@supabase/supabase-js'

interface Customer {
  id: string
  full_name: string
  email: string
  phone: string
  balance: number
}

interface CustomerAuthState {
  user: User | null
  session: Session | null
  customer: Customer | null
  signIn: (email: string, password: string) => Promise<{ success: boolean, error?: string, type?: string } | null>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  updateCustomer: (customerData: { id: string; full_name: string; email: string; phone: string }) => Promise<void>
  refreshCustomerData: () => Promise<void>
}

export const useCustomerAuthStore = create<CustomerAuthState>((set, get) => ({
  user: null,
  session: null,
  customer: null,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null })
    
    if (session?.user) {
      await get().refreshCustomerData()
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null })
      
      if (session?.user) {
        await get().refreshCustomerData()
      } else {
        set({ customer: null })
      }
    })
  },

  refreshCustomerData: async () => {
    const session = get().session
    if (!session?.user) return

    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) throw error
      if (customer) {
        set({ customer })
      }
    } catch (error) {
      console.error('Error refreshing customer data:', error)
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      // Fetch customer data using id
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (customerError || !customer) {
        return { success: false, error: 'No customer account found. Please signup first.' }
      }

      // Check if customer has sufficient balance
      if (customer.balance <= 0) {
        return { 
          success: false, 
          error: 'Insufficient balance. Please add balance to your account before logging in.',
          type: 'balance'
        }
      }

      // Get an available computer
      const { data: computer, error: computerError } = await supabase
        .from('computers')
        .select('id')
        .eq('status', 'available')
        .limit(1)
        .maybeSingle()

      if (computerError) {
        console.error('Failed to find available computer:', computerError)
        return { success: false, error: 'No available computers' }
      }

      // Create a new session
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          customer_id: authData.user.id,
          computer_id: computer?.id,
          hourly_rate: 0, // Varsayılan değer
          status: 'active',
          payment_status: 'unpaid',
          start_time: new Date().toISOString()
        })

      if (sessionError) {
        console.error('Failed to create session:', sessionError)
        return { success: false, error: 'Failed to create session' }
      }

      // Update computer status to in-use
      if (computer?.id) {
        const { error: updateError } = await supabase
          .from('computers')
          .update({ status: 'in-use' })
          .eq('id', computer.id)

        if (updateError) {
          console.error('Failed to update computer status:', updateError)
          return { success: false, error: 'Failed to update computer status' }
        }
      }

      set({
        user: authData.user,
        session: authData.session,
        customer,
      })
      return { success: true }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  },

  signOut: async () => {
    try {
      // Get active sessions for the user
      const { data: activeSessions } = await supabase
        .from('sessions')
        .select('id, computer_id')
        .eq('customer_id', useCustomerAuthStore.getState().user?.id)
        .eq('status', 'active')

      if (activeSessions && activeSessions.length > 0) {
        for (const session of activeSessions) {
          // Update session
          await supabase
            .from('sessions')
            .update({ 
              status: 'completed',
              end_time: new Date().toISOString()
            })
            .eq('id', session.id)

          // Update computer status back to available
          if (session.computer_id) {
            await supabase
              .from('computers')
              .update({ status: 'available' })
              .eq('id', session.computer_id)
          }
        }
      }

      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
      set({ user: null, session: null, customer: null })
    } catch (error: any) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  updateCustomer: async (customerData: { id: string; full_name: string; email: string; phone: string }) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', customerData.id)
        .select('*')
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        set({ customer: data as Customer });
        console.log('Customer updated successfully:', data);
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },
}))

// Initialize auth state when the store is imported
useCustomerAuthStore.getState().initialize()
