import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for the existing code structure
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.REACT_APP_STRIPE_KEY': JSON.stringify(env.REACT_APP_STRIPE_KEY),
      // Helper for Vapi in server/index.js if moved to frontend, mostly for safety
      'process.env.VAPI_ASSISTANT_ID': JSON.stringify(env.VAPI_ASSISTANT_ID),
    },
    build: {
      outDir: 'dist',
    },
  };
});