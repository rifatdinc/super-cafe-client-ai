export const config = {
  supabase: {
    url: process.platform === 'win32' ? 'http://192.168.1.66:54321' : 'http://127.0.0.1:54321',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  },
  socket: {
    url: process.platform === 'win32' 
      ? 'http://192.168.1.66:8080' 
      : 'http://localhost:8080',
    options: {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    }
  },
  app: {
    name: 'Zenith',
    version: '1.0.0'
  },
  dev: {
    serverUrl: 'http://0.0.0.0:9002'
  }
};
