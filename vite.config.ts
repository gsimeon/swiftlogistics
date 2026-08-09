import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
  const repositoryName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
  
  let basePath = './'; // Use relative base path by default to prevent blank screen across Vercel and GitHub Pages
  if (isGithubActions && repositoryName) {
    basePath = `/${repositoryName}/`;
  } else if (process.env.VITE_BASE_PATH) {
    basePath = process.env.VITE_BASE_PATH;
    if (!basePath.endsWith('/')) {
      basePath += '/';
    }
    if (!basePath.startsWith('/')) {
      basePath = `/${basePath}`;
    }
  }

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
