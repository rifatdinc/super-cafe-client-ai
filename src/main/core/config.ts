export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  },
  socket: {
    url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080',
    options: {
      reconnection: import.meta.env.VITE_SOCKET_RECONNECTION === 'true' || true,
      reconnectionAttempts: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_ATTEMPTS || '5', 10),
      reconnectionDelay: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY || '1000', 10),
      reconnectionDelayMax: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY_MAX || '5000', 10),
      timeout: parseInt(import.meta.env.VITE_SOCKET_TIMEOUT || '10000', 10)
    }
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Zenith',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0'
  },
  dev: {
    serverUrl: import.meta.env.VITE_DEV_SERVER_URL || 'http://localhost:9002'
  }
};

// Environment variables kontrolü
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('VITE_SUPABASE_URL not found in environment, using default local URL');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_ANON_KEY not found in environment, using default local key');
}

if (!import.meta.env.VITE_SOCKET_URL) {
  console.warn('VITE_SOCKET_URL not found in environment, using default local URL');
}