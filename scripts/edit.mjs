import { createServer } from 'vite'
import { startEditor } from '../editor/server.ts'

let preview
let editor
try {
  preview = await createServer({ server: { host: '127.0.0.1', port: 5173 } })
  await preview.listen()
  const port = Number(process.env.PORTFOLIO_EDITOR_PORT || 5177)
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error('PORTFOLIO_EDITOR_PORT must be between 1024 and 65535.')
  editor = await startEditor({ port, previewUrl: preview.resolvedUrls.local[0] })
  console.log(
    `\nPortfolio editor: ${editor.url}\nWebsite preview: ${preview.resolvedUrls.local[0]}\n\nSave edits locally in the editor. Push to GitHub to publish.\nKeep this terminal open. Press Ctrl+C to stop.\n`,
  )
  const stop = async () => {
    await editor.close()
    await preview.close()
    process.exit(0)
  }
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
} catch (error) {
  console.error(error.message)
  if (editor) await editor.close()
  if (preview) await preview.close()
  process.exitCode = 1
}
