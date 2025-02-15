interface IpcRenderer {
  invoke: (channel: string, data: any) => Promise<any>;
  on: (channel: string, func: (...args: any[]) => void) => void;
  once: (channel: string, func: (...args: any[]) => void) => void;
  removeListener: (channel: string, func: (...args: any[]) => void) => void;
  send: (channel: string, data: any) => void;
  scanComputers: (data: { startIP: string; endIP: string }) => Promise<any>;
}

interface SystemInfo {
  os: any;
  cpu: any;
  mem: any;
  disk: any;
  graphics: any;
}

declare global {
  interface Window {
    electron: {
      ipcRenderer: IpcRenderer;
      getMachineId: () => Promise<string>;
      getSystemInfo: () => Promise<SystemInfo>;
    }
  }
}

export {};