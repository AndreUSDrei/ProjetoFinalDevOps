import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const RENDER_API_URL = 'https://valorant-manager-api.onrender.com';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const configuredApiUrl = env.VITE_API_URL?.trim();
  const defaultApiUrl = process.env.VERCEL === '1' ? RENDER_API_URL : '';
  const apiUrl = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, '');
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'unknown';

  return {
    plugins: [
      react(),
      {
        name: 'deployment-metadata',
        transformIndexHtml: () => [
          {
            tag: 'meta',
            attrs: { name: 'app-commit', content: commit },
            injectTo: 'head',
          },
        ],
      },
    ],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true },
        '/health': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.js'],
    },
  };
});
