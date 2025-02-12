interface Window {
  electron?: {
    getDesktopSources: () => Promise<any>;
    startStream: (computerId: string) => Promise<void>;
    stopStream: () => Promise<void>;
    getIpAddress: () => Promise<string>;
    connectToStream: (options: { computerId: string; ipAddress: string; port: number }) => Promise<any>;
    platform: string;
  };
}
