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
})
