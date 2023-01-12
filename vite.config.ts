import { defineConfig, UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

export const commonConfig: UserConfig = {
  plugins: [react(), tsconfigPaths()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    rollupOptions: {
      external: ['/env'],
    },
    outDir: 'build',
    sourcemap: true,
  },
}

export default defineConfig(({ mode }) => {
  const commitHash = execSync('git describe --always').toString().trimEnd()
  process.env.VITE_APP_RELEASE = `g${commitHash}`

  if (mode !== 'development') {
    return commonConfig
  }
  const target = 'http://localhost:8080'

  return {
    ...commonConfig,
    ...{
      server: {
        port: 3000,
        proxy: {
          '/api': { target, changeOrigin: true },
          '/env': { target, changeOrigin: true },
        },
      },
    },
  }
})
