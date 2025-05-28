import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Import the plugin
import path from 'path'; // Keep the path import for aliases

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '/@/': path.resolve(__dirname, 'src'),
    },
  },
});

