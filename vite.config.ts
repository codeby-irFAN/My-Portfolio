import { defineConfig, loadEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createChatHandler } from './server/chat.ts'
import { generateAssets, readPortfolio, renderMetadata } from './scripts/assets.ts'

export default defineConfig(async ({ mode }) => {
  const content = readPortfolio()
  await generateAssets(content)
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
        transformIndexHtml(html) {
          return html.replace('<!-- portfolio:metadata -->', renderMetadata(readPortfolio()))
        },
        configureServer(server) {
          server.middlewares.use('/api/chat', handler)
        },
        configurePreviewServer(server) {
          server.middlewares.use('/api/chat', handler)
        },
      },
    ],
  } satisfies UserConfig
})
