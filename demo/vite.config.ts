import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/react-hanzi-input/',
  resolve: {
    alias: {
      'react-hanzi-input': resolve(__dirname, '../src/index.ts'),
    },
  },
})
