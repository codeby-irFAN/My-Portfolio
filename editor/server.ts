import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { createServer, type IncomingMessage } from 'node:http'
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  renameSync,
  existsSync,
  rmSync,
  mkdtempSync,
  copyFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPortfolio } from '../src/content/model.ts'
import { generateAssets } from '../scripts/assets.ts'

const editorFiles = fileURLToPath(new URL('.', import.meta.url))
export const revisionOf = (bytes: string) => createHash('sha256').update(bytes).digest('hex')
const readBody = (request: IncomingMessage, limit: number) =>
  new Promise<Buffer>((accept, reject) => {
    const chunks: Buffer[] = []
    let length = 0
    request.on('data', (chunk: Buffer) => {
      length += chunk.length
      if (length <= limit) chunks.push(chunk)
    })
    request.on('end', () =>
      length > limit ? reject(new Error('Request is too large.')) : accept(Buffer.concat(chunks)),
    )
    request.on('error', reject)
  })

export async function startEditor(
  options: { root?: string; port?: number; previewUrl?: string } = {},
) {
  const root = resolve(options.root || process.cwd())
  const contentPath = join(root, 'content/portfolio.json')
  const publicDir = join(root, 'public')
  const token = randomBytes(32).toString('hex')
  let origin = ''
  let saving = false
  const snapshot = () => {
    const bytes = readFileSync(contentPath, 'utf8')
    return { content: JSON.parse(bytes), revision: revisionOf(bytes) }
  }
  // Fail at startup with a useful content error instead of opening a broken editor.
  createPortfolio(snapshot().content)
  const server = createServer(async (request, response) => {
    const send = (status: number, body: unknown) => {
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
      response.end(JSON.stringify(body))
    }
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    )
    if (`http://${request.headers.host}` !== origin)
      return send(403, { error: 'Use the local editor address printed in the terminal.' })
    if (request.method === 'POST') {
      const provided = request.headers['x-editor-token']
      if (
        request.headers.origin !== origin ||
        typeof provided !== 'string' ||
        !/^[a-f0-9]{64}$/.test(provided) ||
        !timingSafeEqual(Buffer.from(provided), Buffer.from(token))
      )
        return send(403, { error: 'Open this editor in a browser before saving.' })
    }
    try {
      const url = new URL(request.url || '/', origin)
      if (request.method === 'GET' && url.pathname === '/api/content') return send(200, snapshot())
      if (request.method === 'POST' && url.pathname === '/api/content') {
        if (!request.headers['content-type']?.startsWith('application/json'))
          return send(415, { error: 'Expected JSON content.' })
        if (saving)
          return send(409, { error: 'Another save is in progress. Try again in a moment.' })
        const body = JSON.parse((await readBody(request, 256 * 1024)).toString())
        if (saving)
          return send(409, { error: 'Another save is in progress. Try again in a moment.' })
        if (body?.revision !== snapshot().revision)
          return send(409, {
            error:
              'The file changed outside this editor. Download your draft, then reload before saving.',
          })
        const portfolio = createPortfolio(body.content)
        const staging = mkdtempSync(join(tmpdir(), 'portfolio-save-'))
        saving = true
        try {
          if (portfolio.resume.mode === 'custom') {
            const target = join(staging, portfolio.resume.file)
            mkdirSync(resolve(target, '..'), { recursive: true })
            if (!existsSync(join(publicDir, portfolio.resume.file)))
              throw new Error('Upload your custom PDF first, or choose generated mode.')
            copyFileSync(join(publicDir, portfolio.resume.file), target)
          }
          await generateAssets(portfolio, staging)
          // Recheck after generation in case an external program edited the file meanwhile.
          if (body.revision !== snapshot().revision)
            return send(409, {
              error: 'The file changed while saving. Download your draft, then reload.',
            })
          const bytes = JSON.stringify(body.content, null, 2) + '\n'
          const temporary = contentPath + '.tmp'
          try {
            for (const file of [
              'profile.html',
              'og-card.svg',
              'og-card.png',
              ...(portfolio.resume.mode === 'generated' ? [portfolio.resume.file] : []),
            ]) {
              const destination = join(publicDir, file)
              mkdirSync(resolve(destination, '..'), { recursive: true })
              const next = readFileSync(join(staging, file))
              if (!existsSync(destination) || !readFileSync(destination).equals(next))
                writeFileSync(destination, next)
            }
            writeFileSync(temporary, bytes, { flag: 'w' })
            renameSync(temporary, contentPath)
          } finally {
            if (existsSync(temporary)) rmSync(temporary)
          }
          return send(200, {
            revision: revisionOf(bytes),
            message:
              'Saved locally. Preview refreshes automatically. Push to GitHub when ready to publish.',
          })
        } finally {
          rmSync(staging, { recursive: true, force: true })
          saving = false
        }
      }
      if (request.method === 'POST' && url.pathname === '/api/upload') {
        const bytes = await readBody(request, 8 * 1024 * 1024)
        const kind = url.searchParams.get('kind')
        let extension = ''
        if (kind === 'resume' && bytes.subarray(0, 5).toString() === '%PDF-') extension = 'pdf'
        if (kind === 'image') {
          if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
            extension = 'png'
          else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) extension = 'jpg'
          else if (
            bytes.subarray(0, 4).toString() === 'RIFF' &&
            bytes.subarray(8, 12).toString() === 'WEBP'
          )
            extension = 'webp'
        }
        if (!extension)
          return send(400, {
            error: 'Choose a PDF résumé, or a PNG, JPEG, or WebP image. Maximum 8 MB.',
          })
        const file = `uploads/${kind}-${randomBytes(8).toString('hex')}.${extension}`
        mkdirSync(join(publicDir, 'uploads'), { recursive: true })
        writeFileSync(join(publicDir, file), bytes, { flag: 'wx' })
        return send(200, { path: kind === 'resume' ? file : `/${file}` })
      }
      if (request.method === 'GET' && ['/', '/editor.js', '/editor.css'].includes(url.pathname)) {
        const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1)
        let bytes: string | Buffer = readFileSync(join(editorFiles, name))
        if (name === 'index.html')
          bytes = bytes
            .toString()
            .replace(
              '__EDITOR_CONFIG__',
              JSON.stringify({ token, previewUrl: options.previewUrl || null }).replaceAll(
                '<',
                '\\u003c',
              ),
            )
        response.writeHead(200, {
          'Content-Type': name.endsWith('.js')
            ? 'text/javascript; charset=utf-8'
            : name.endsWith('.css')
              ? 'text/css; charset=utf-8'
              : 'text/html; charset=utf-8',
        })
        return response.end(bytes)
      }
      return send(404, { error: 'Not found.' })
    } catch (error) {
      // No environment variables or credentials are read or returned by this server.
      return send(400, {
        error: error instanceof Error ? error.message : 'Could not complete that change.',
      })
    }
  })
  await new Promise<void>((accept, reject) => {
    server.once('error', reject)
    server.listen(options.port ?? 5177, '127.0.0.1', accept)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Could not start local editor.')
  origin = `http://127.0.0.1:${address.port}`
  return {
    server,
    url: origin,
    close: () =>
      new Promise<void>((accept, reject) => {
        server.closeAllConnections()
        server.close((error) => (error ? reject(error) : accept()))
      }),
  }
}
