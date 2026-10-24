import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import content from '../content/portfolio.json' with { type: 'json' }
import { startEditor } from './server.ts'
import { get } from 'node:http'

test('local editor protects writes, validates content, saves assets, and detects stale drafts', async () => {
  const root = mkdtempSync(join(tmpdir(), 'portfolio-editor-'))
  mkdirSync(join(root, 'content'))
  const path = join(root, 'content/portfolio.json')
  writeFileSync(path, JSON.stringify(content))
  const editor = await startEditor({ root, port: 0 })
  try {
    const html = await (await fetch(editor.url)).text()
    const token = JSON.parse(html.match(/id="editor-config">(.*?)<\/script>/s)![1]).token
    const headers = {
      Origin: editor.url,
      'X-Editor-Token': token,
      'Content-Type': 'application/json',
    }
    const original = await (await fetch(editor.url + '/api/content')).json()
    const next = structuredClone(original.content)
    next.profile.name = 'Test Owner'
    next.assistant.personality = 'Concise and upbeat.'
    const save = (body: unknown, override = {}) =>
      fetch(editor.url + '/api/content', {
        method: 'POST',
        headers: { ...headers, ...override },
        body: JSON.stringify(body),
      })
    assert.equal(
      (await save({ content: next, revision: original.revision }, { 'X-Editor-Token': '' })).status,
      403,
    )
    assert.equal(
      (
        await save(
          { content: next, revision: original.revision },
          { Origin: 'https://evil.example' },
        )
      ).status,
      403,
    )
    assert.equal((await save({}, { 'X-Editor-Token': 'é'.repeat(64) })).status, 403)
    const badHost = await new Promise<number | undefined>((accept, reject) => {
      get(editor.url, { headers: { Host: 'evil.example' } }, (response) => {
        response.resume()
        accept(response.statusCode)
      }).on('error', reject)
    })
    assert.equal(badHost, 403)
    assert.equal((await fetch(editor.url + '/.env')).status, 404)
    assert.equal(JSON.parse(readFileSync(path, 'utf8')).profile.name, content.profile.name)
    next.resume.file = '../outside.pdf'
    assert.equal((await save({ content: next, revision: original.revision })).status, 400)
    next.resume.file = content.resume.file
    const response = await save({ content: next, revision: original.revision })
    assert.equal(response.status, 200, await response.clone().text())
    assert.notEqual((await response.json()).revision, original.revision)
    assert.equal(
      JSON.parse(readFileSync(path, 'utf8')).assistant.personality,
      'Concise and upbeat.',
    )
    assert.match(readFileSync(join(root, 'public/profile.html'), 'utf8'), /Test Owner/)
    assert.ok(existsSync(join(root, 'public', content.resume.file)))
    assert.equal((await save({ content, revision: original.revision })).status, 409)
    const upload = await fetch(editor.url + '/api/upload?kind=image&name=../../evil.png', {
      method: 'POST',
      headers,
      body: readFileSync('public/og-card.png'),
    })
    assert.equal(upload.status, 200)
    const { path: image } = await upload.json()
    assert.match(image, /^\/uploads\/image-[a-f0-9]+\.png$/)
    assert.ok(existsSync(join(root, 'public', image)))
    const invalid = await fetch(editor.url + '/api/upload?kind=image', {
      method: 'POST',
      headers,
      body: '<svg onload="alert(1)"></svg>',
    })
    assert.equal(invalid.status, 400)
    const pdfBytes = readFileSync(join(root, 'public', content.resume.file))
    const pdfUpload = await fetch(editor.url + '/api/upload?kind=resume', {
      method: 'POST',
      headers,
      body: pdfBytes,
    })
    assert.equal(pdfUpload.status, 200)
    const pdfPath = (await pdfUpload.json()).path
    const current = await (await fetch(editor.url + '/api/content')).json()
    current.content.resume = { mode: 'custom', file: pdfPath }
    assert.equal((await save(current)).status, 200)
    assert.deepEqual(readFileSync(join(root, 'public', pdfPath)), pdfBytes)
    const tooBig = await fetch(editor.url + '/api/content', {
      method: 'POST',
      headers,
      body: 'x'.repeat(256 * 1024 + 1),
    })
    assert.equal(tooBig.status, 400)
  } finally {
    await editor.close()
    rmSync(root, { recursive: true, force: true })
  }
})
