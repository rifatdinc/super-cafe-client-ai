import { create } from 'zustand'
import { supabase } from '../supabase'
import { Session, User } from '@supabase/supabase-js'

type Theme = 'light' | 'dark' | 'system'

interface Settings {
  theme: Theme
}

interface AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  settings: Settings
  updateSettings: (settings: Partial<Settings>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  settings: {
    theme: 'system'
  },

  initialize: async () => {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    set({ user: data.user, session: data.session })
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    set({ user: null, session: null })
  },

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }))
}))

// Initialize auth state when the store is imported
useAuthStore.getState().initialize()
