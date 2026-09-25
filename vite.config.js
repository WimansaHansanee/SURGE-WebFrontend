import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Add the specific host mentioned in your error message or the general .dev suffix
    allowedHosts: [
      'conjoined-discolor-scooter.ngrok-free.dev', 
      '.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});