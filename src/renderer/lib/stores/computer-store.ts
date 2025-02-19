import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface Computer {
  id: string;
  machine_id: string;
  name: string;
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
  computer_number: string;
  specifications?: any;
}

interface ComputerStore {
  currentComputer: Computer | null;
  socket: any;
  isConnected: boolean;
  retryCount: number;
  maxRetries: number;
  isInitialized: boolean;
  error: string | null;
  initializeComputer: () => Promise<void>;
  updateComputer: (data: Partial<Computer>) => Promise<void>;
  initializeSocket: () => void;
  reconnectSocket: () => void;
  sendCommand: (type: string, data: any) => void;
  getSystemMetrics: () => void;
}

export const useComputerStore = create<ComputerStore>((set, get) => ({
  currentComputer: null,
  socket: null,
  isConnected: false,
  retryCount: 0,
  maxRetries: 5,
  isInitialized: false,
  error: null,

  initializeSocket: () => {
    try {
      if (get().isInitialized) {
        console.log('Socket is already initialized');
        return;
      }

      const socket = window.electron.socket.connect();
      
      socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        set({ isConnected: true, retryCount: 0, isInitialized: true, error: null });
        toast.success('Sunucu bağlantısı kuruldu');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        set({ isConnected: false, isInitialized: false });
        toast.error('Sunucu bağlantısı kesildi');
        get().reconnectSocket();
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        toast.error('Sunucu bağlantısı kurulamadı: ' + error.message);
        set({ error: error.message || 'Connection error' });
        get().reconnectSocket();
      });

      socket.on('connect_timeout', () => {
        console.error('Connection timeout');
        toast.error('Sunucu bağlantısı zaman aşımına uğradı');
        set({ error: 'Connection timeout' });
        get().reconnectSocket();
      });

      socket.on('registered', (response) => {
        if (response.success) {
          console.log('Registration successful');
          get().getSystemMetrics();
        } else {
          console.error('Registration failed:', response.error);
          toast.error('Kayıt başarısız: ' + response.error);
        }
      });

      socket.on('command_response', (response) => {
        if (response.success) {
          console.log('Command executed successfully:', response);
          toast.success('Komut başarıyla çalıştırıldı');
        } else {
          console.error('Command execution failed:', response);
          toast.error('Komut çalıştırılamadı: ' + (response.error || 'Bilinmeyen hata'));
        }
      });

      socket.on('system_metrics_response', (response) => {
        if (response.success) {
          console.log('System metrics received:', response.data);
        } else {
          console.error('Failed to get system metrics:', response.error);
        }
      });

      set({ socket });
    } catch (error) {
      console.error('Error initializing Socket.IO:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to initialize Socket.IO' });
      toast.error('Sunucu bağlantısı başlatılamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  },

  reconnectSocket: () => {
    const { retryCount, maxRetries } = get();
    if (retryCount < maxRetries) {
      set((state) => ({ retryCount: state.retryCount + 1 }));
      toast.info(`Sunucuya yeniden bağlanılıyor... (${retryCount + 1}/${maxRetries})`);
      setTimeout(() => get().initializeSocket(), 5000);
    } else {
      toast.error(`Sunucuya bağlanma başarısız oldu. Maksimum deneme sayısına ulaşıldı (${maxRetries})`);
    }
  },

  sendCommand: (type: string, data: any) => {
    try {
      const { socket } = get();
      if (!socket) throw new Error('Socket.IO connection not established');
      
      socket.emit('command', { type, ...data });
    } catch (error) {
      console.error('Error sending command:', error);
      toast.error('Komut gönderilemedi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  },

  getSystemMetrics: () => {
    try {
      const { socket } = get();
      if (!socket) throw new Error('Socket.IO connection not established');
      
      socket.emit('system_metrics');
    } catch (error) {
      console.error('Error requesting system metrics:', error);
    }
  },

  initializeComputer: async () => {
    try {
      if (!window.electron?.getMachineId) {
        throw new Error('getMachineId is not available. Electron context might not be initialized.');
      }

      const machineId = await window.electron.getMachineId();
      if (!machineId) {
        throw new Error('Failed to get machine ID');
      }

      // Socket.IO bağlantısını başlat
      get().initializeSocket();
      
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
