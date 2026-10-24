import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createChatHandler } from './server/chat.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const handler = createChatHandler(() => ({
    apiKey: process.env.GROQ_API_KEY || env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || env.GROQ_MODEL,
  }))
  return {
    plugins: [
      react(),
      {
        name: 'portfolio-chat-api',
        configureServer(server) {
          server.middlewares.use('/api/chat', handler)
        },
        configurePreviewServer(server) {
          server.middlewares.use('/api/chat', handler)
        },
      },
    ],
  }
})
