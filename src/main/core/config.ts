export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  },
  socket: {
    url: process.env.SOCKET_URL || 'http://localhost:8080',
    options: {
      reconnection: process.env.SOCKET_RECONNECTION === 'true' || true,
      reconnectionAttempts: parseInt(process.env.SOCKET_RECONNECTION_ATTEMPTS || '5', 10),
      reconnectionDelay: parseInt(process.env.SOCKET_RECONNECTION_DELAY || '1000', 10),
      reconnectionDelayMax: parseInt(process.env.SOCKET_RECONNECTION_DELAY_MAX || '5000', 10),
      timeout: parseInt(process.env.SOCKET_TIMEOUT || '10000', 10)
    }
  },
  app: {
    name: process.env.APP_NAME || 'Zenith',
    version: process.env.APP_VERSION || '1.0.0'
  },
  dev: {
    serverUrl: process.env.DEV_SERVER_URL || 'http://localhost:9002'
  }
};