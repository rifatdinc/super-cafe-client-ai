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
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  updateCustomer: (customerData: { id: string; full_name: string; email: string; phone: string }) => Promise<void>;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  user: null,
  session: null,
  customer: null,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null })

    if (session?.user) {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!error && customer) {
        set({ customer })
      }
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null })
      
      if (session?.user) {
        const { data: customer, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && customer) {
          set({ customer })
        }
      } else {
        set({ customer: null })
      }
    })
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      // Fetch customer data using id
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (customerError || !customer) {
        throw new Error('No customer account found. Please signup first.')
      }

      set({
        user: authData.user,
        session: authData.session,
        customer,
      })
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    set({ user: null, session: null, customer: null })
  },

  updateCustomer: async (customerData: { id: string; full_name: string; email: string; phone: string }) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', customerData.id)
        .select('*')
        .single();

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
