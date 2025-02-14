import { contextBridge, ipcRenderer } from 'electron'

// Basic IPC wrapper
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, data: any) => {
      return ipcRenderer.invoke(channel, data)
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    },
    once: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.once(channel, (event, ...args) => func(...args))
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, func)
    },
    send: (channel: string, data: any) => {
      ipcRenderer.send(channel, data)
    }
  },
  getMachineId: () => {
    return ipcRenderer.invoke('get-machine-id')
  },
  getSystemInfo: () => {
    return ipcRenderer.invoke('get-system-info')
  }
})
