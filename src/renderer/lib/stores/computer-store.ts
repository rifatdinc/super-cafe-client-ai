import { create } from 'zustand'
import { supabase } from '../supabase'

interface Computer {
  id: string
  computer_number: string
  name: string
  status: 'available' | 'in_use' | 'maintenance'
  ip_address: string
  mac_address: string
}

interface ComputerStore {
  currentComputer: Computer | null
  loading: boolean
  error: string | null
  initializeComputer: () => Promise<void>
}

export const useComputerStore = create<ComputerStore>((set) => ({
  currentComputer: null,
  loading: false,
  error: null,

  initializeComputer: async () => {
    set({ loading: true, error: null })
    try {
      // Get computer info from main process
      const computerInfo = await window.Electron.ipcRenderer.invoke('get-computer-info')
      
      // Check if computer exists in database
      const { data: existingComputer, error: fetchError } = await supabase
        .from('computers')
        .select('*')
        .eq('mac_address', computerInfo.macAddress)
        .single()

      if (fetchError) {
        // Only create new computer if it doesn't exist
        if (fetchError.code === 'PGRST116') { // PGRST116 is "no rows returned"
          // First check if computer number exists
          let computerNumber = `PC-${computerInfo.hostname}`
          const { data: existingNumber } = await supabase
            .from('computers')
            .select('computer_number')
            .eq('computer_number', computerNumber)
            .single()

          if (existingNumber) {
            // If computer number exists, append a random number
            const randomSuffix = Math.floor(Math.random() * 1000)
            computerNumber = `PC-${computerInfo.hostname}-${randomSuffix}`
          }

          const { data: newComputer, error: createError } = await supabase
            .from('computers')
            .insert({
              computer_number: computerNumber,
              name: computerInfo.hostname,
              status: 'available',
              ip_address: computerInfo.ipAddress,
              mac_address: computerInfo.macAddress,
              specifications: {
                hostname: computerInfo.hostname,
                platform: computerInfo.platform,
                arch: computerInfo.arch
              }
            })
            .select()
            .single()

          if (createError) throw createError
          set({ currentComputer: newComputer as Computer })
        } else {
          throw fetchError
        }
      } else {
        // Update IP address if it has changed
        if (existingComputer.ip_address !== computerInfo.ipAddress) {
          const { data: updatedComputer, error: updateError } = await supabase
            .from('computers')
            .update({ ip_address: computerInfo.ipAddress })
            .eq('id', existingComputer.id)
            .select()
            .single()

          if (updateError) throw updateError
          set({ currentComputer: updatedComputer as Computer })
        } else {
          set({ currentComputer: existingComputer as Computer })
        }
      }
    } catch (error) {
      console.error('Error initializing computer:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  }
}))
