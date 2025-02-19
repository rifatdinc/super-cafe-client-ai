import { contextBridge, ipcRenderer } from 'electron'
import { io, Socket } from 'socket.io-client';
import { config } from './core/config';

let socket: Socket | null = null;

function initializeSocket() {
  if (!socket) {
    console.log('Initializing Socket.IO connection to:', config.socket.url);
    socket = io(config.socket.url, {
      reconnection: config.socket.options.reconnection,
      reconnectionAttempts: config.socket.options.reconnectionAttempts,
      reconnectionDelay: config.socket.options.reconnectionDelay,
      reconnectionDelayMax: config.socket.options.reconnectionDelayMax,
      timeout: config.socket.options.timeout,
    });
    
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      console.log('Socket ID:', socket?.id);
      console.log('Transport:', socket?.io.engine.transport.name);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server');
      console.log('Disconnect reason:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      ipcRenderer.send('socket-error', {
        type: 'connect_error',
        message: error.message
      });
    });

    socket.on('connect_timeout', () => {
      console.error('Connection timeout');
      ipcRenderer.send('socket-error', {
        type: 'connect_timeout',
        message: 'Connection timeout'
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      ipcRenderer.send('socket-error', {
        type: 'error',
        message: error.message || 'Unknown socket error'
      });
    });

    // Add handlers for registration events
    socket.on('registered', (response) => {
      console.log('Registration response:', response);
      if (response.success) {
        console.log('Successfully registered with server');
      } else {
        console.error('Registration failed:', response.error);
      }
    });

    // Monitor reconnection attempts
    socket.io.on('reconnect_attempt', (attemptNumber) => {
      console.log('Attempting to reconnect:', attemptNumber);
    });

    socket.io.on('reconnect', (attemptNumber) => {
      console.log('Successfully reconnected after', attemptNumber, 'attempts');
    });

    socket.io.on('reconnect_failed', () => {
      console.error('Failed to reconnect after all attempts');
    });
  }
  return socket;
}

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      const validChannels = ['minimize-window', 'maximize-window', 'close-window', 'get-network-info', 'socket-error']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args)
      }
    },
    invoke: (channel: string, ...args: any[]) => {
      const validChannels = ['send-wol', 'get-machine-id', 'get-system-info']
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args)
      }
      throw new Error(`Invalid invoke channel: ${channel}`)
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['window-state-change', 'network-info']
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_event, ...args) => func(...args))
      }
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['window-state-change', 'network-info']
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func)
      }
    }
  },
  socket: {
    connect: () => {
      const currentSocket = initializeSocket();
      return {
        on: (event: string, callback: (...args: any[]) => void) => {
          currentSocket?.on(event, callback);
        },
        emit: (event: string, data: any) => {
          if (!currentSocket?.connected) {
            ipcRenderer.send('socket-error', {
              type: 'not_connected',
              message: 'Socket is not connected'
            });
            return;
          }
          currentSocket.emit(event, data);
        },
        disconnect: () => {
          if (currentSocket) {
            currentSocket.disconnect();
            socket = null;
          }
        }
      };
    }
  },
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});
