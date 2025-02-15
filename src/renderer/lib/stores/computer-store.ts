import { create } from 'zustand';
import { supabase } from '../supabase';

interface Computer {
  id: string;
  machine_id: string;
  name: string;
  status: 'available' | 'in-use' | 'maintenance';
  computer_number: string;
  specifications?: string;
}

interface ComputerStore {
  currentComputer: Computer | null;
  initializeComputer: () => Promise<void>;
  updateComputer: (data: Partial<Computer>) => Promise<void>;
}

export const useComputerStore = create<ComputerStore>((set) => ({
  currentComputer: null,

  initializeComputer: async () => {
    try {
      if (!window.electron?.getMachineId) {
        throw new Error('getMachineId is not available. Electron context might not be initialized.');
      }

      const machineId = await window.electron.getMachineId();
      if (!machineId) {
        throw new Error('Failed to get machine ID');
      }
      
      // Check if computer exists
      const { data: existingComputer, error } = await supabase
        .from('computers')
        .select('*')
        .eq('machine_id', machineId)
        .limit(1)
        .single();

      if (existingComputer) {
        set({ currentComputer: existingComputer });
        return;
      }

      // Get all computer numbers to find an available one
      const { data: computers } = await supabase
        .from('computers')
        .select('computer_number')
        .order('computer_number');

      // Find the first available number
      let nextNumber = 1;
      const usedNumbers = new Set(
        computers?.map(c => parseInt(c.computer_number.replace(/\D/g, ''))) || []
      );

      while (usedNumbers.has(nextNumber)) {
        nextNumber++;
      }

      // Create new computer with the first available number
      const computerNumber = `PC${nextNumber.toString().padStart(3, '0')}`;
      
      const { data: newComputer, error: insertError } = await supabase
        .from('computers')
        .insert({
          machine_id: machineId,
          computer_number: computerNumber,
          name: `PC-${machineId.slice(0, 6)}`,
          status: 'available',
          specifications: JSON.stringify(await window.electron.getSystemInfo())
        })
        .select()
        .single();

      if (insertError) throw insertError;
      set({ currentComputer: newComputer });

    } catch (error) {
      console.error('Computer registration error:', error);
      throw error;
    }
  },

  updateComputer: async (updateData) => {
    try {
      if (!window.electron?.getMachineId) {
        throw new Error('getMachineId is not available');
      }

      const machineId = await window.electron.getMachineId();
      if (!machineId) {
        throw new Error('Failed to get machine ID');
      }
      
      const { data, error } = await supabase
        .from('computers')
        .update(updateData)
        .eq('machine_id', machineId)
        .select()
        .single();

      if (error) throw error;
      set({ currentComputer: data });
    } catch (error) {
      console.error('Computer update error:', error);
      throw error;
    }
  }
}));
