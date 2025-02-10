import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    envDir: '.',
    envPrefix: 'VITE_',
    root: path.join(__dirname, 'src/renderer'),
    publicDir: path.join(__dirname, 'public'),
    server: {
      port: 9002,
      strictPort: true,
      host: true,
    },
    define: {
      'process.env': env
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, './src'),
        '@/renderer': path.join(__dirname, './src/renderer'),
        '@/main': path.join(__dirname, './src/main'),
        '@/types': path.join(__dirname, './src/types')
      }
    },
    build: {
      outDir: path.join(__dirname, 'dist/renderer'),
      emptyOutDir: true,
      target: 'esnext',
      rollupOptions: {
        input: {
          main: path.join(__dirname, 'src/renderer/index.html')
        }
      }
    }
  }
});
