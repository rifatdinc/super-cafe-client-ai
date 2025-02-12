import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      // Whitelist channels
      const validChannels = ['minimize-window', 'maximize-window', 'close-window']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args)
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['window-state-change']
      if (validChannels.includes(channel)) {
        // Strip event as it includes `sender` 
        ipcRenderer.on(channel, (_event, ...args) => func(...args))
      }
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['window-state-change']
      if (validChannels.includes(channel)) {
        // Strip event as it includes `sender`
        ipcRenderer.removeListener(channel, (_event, ...args) => func(...args))
      }
    },
    scanComputers: async (startIP: string, endIP: string) => {
      console.log("Scanning computers from preload");
      return ipcRenderer.invoke('scan-computers', { startIP, endIP });
    },
  },
  systemMetrics: {
    get: () => ipcRenderer.invoke('get-system-metrics'),
    onUpdate: (callback: (metrics: any) => void) => {
      ipcRenderer.on('system-metrics-update', (_, metrics) => callback(metrics));
      return () => {
        ipcRenderer.removeAllListeners('system-metrics-update');
      };
    }
  },
  startStreaming: (id: string) => ipcRenderer.invoke('start-streaming', id),
  stopStreaming: (id: string) => ipcRenderer.invoke('stop-streaming', id),
  getSystemMetrics: () => ipcRenderer.invoke('get-system-metrics'),
  getNetworkInfo: () => ipcRenderer.invoke('get-network-info'),
  getComputerInfo: () => ipcRenderer.invoke('get-computer-info'),
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  // Stream yönetimi
  startStream: (computerId: string) => ipcRenderer.invoke('start-stream', { computerId }),
  stopStream: () => ipcRenderer.invoke('stop-stream'),
  onStreamSource: (callback: (event: any, data: any) => void) => {
    ipcRenderer.on('stream-source', callback);
    return () => {
      ipcRenderer.removeListener('stream-source', callback);
    };
  },
  // IP ve WebRTC metodları
  getIpAddress: () => ipcRenderer.invoke('get-ip-address'),
  connectToStream: (options: { computerId: string, ipAddress: string, port: number }) => 
    ipcRenderer.invoke('connect-to-stream', options),
  platform: process.platform
})
