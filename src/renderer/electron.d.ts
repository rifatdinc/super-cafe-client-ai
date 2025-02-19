interface IpcRenderer {
  invoke: (channel: string, data: any) => Promise<any>;
  on: (channel: string, func: (...args: any[]) => void) => void;
  once: (channel: string, func: (...args: any[]) => void) => void;
  removeListener: (channel: string, func: (...args: any[]) => void) => void;
  send: (channel: string, data: any) => void;
}

interface SystemInfo {
  os: any;
  cpu: any;
  mem: any;
  disk: any;
  graphics: any;
}

interface IElectronAPI {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => void
    invoke: (channel: string, ...args: any[]) => Promise<any>
    on: (channel: string, func: (...args: any[]) => void) => void
    removeListener: (channel: string, func: (...args: any[]) => void) => void
    getNetworkInfo: () => Promise<any>
    sendWakeOnLan: (macAddress: string, ipAddress?: string) => Promise<any>
  }
  socket: {
    connect: () => {
      on: (event: string, callback: (...args: any[]) => void) => void
      emit: (event: string, data: any) => void
      disconnect: () => void
    }
  }
}

declare global {
  interface Window {
    electron: IElectronAPI
  }

  namespace React {
    interface CSSProperties {
      WebkitAppRegion?: 'drag' | 'no-drag';
    }
  }
}

export {};