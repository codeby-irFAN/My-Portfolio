import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { PDFDocument } from 'pdf-lib'
import content from '../content/portfolio.json' with { type: 'json' }
import { createPortfolio } from '../src/content/model.ts'
import { generateAssets, renderMetadata, renderProfileHtml } from './assets.ts'

test('generated PDF and sharing assets follow edited content and are deterministic', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'portfolio-assets-'))
  try {
    const next = structuredClone(content)
    next.profile.name = 'Sam Example'
    next.education.studyYear = 'third-year'
    next.profile.tagline = 'Make useful things & share <ideas>.'
    const data = createPortfolio(next)
    assert.match(renderMetadata(data), /Sam Example/)
    assert.match(renderProfileHtml(data), /third-year/)
    assert.match(renderProfileHtml(data), /&amp; share &lt;ideas&gt;/)
    assert.doesNotMatch(renderMetadata(data), /Irfan/)
    await generateAssets(data, directory)
    const pdf = readFileSync(join(directory, data.resume.file))
    const parsed = await PDFDocument.load(pdf)
    assert.equal(parsed.getAuthor(), 'Sam Example')
    assert.ok(parsed.getPageCount() >= 1)
    assert.equal(readFileSync(join(directory, 'og-card.png')).subarray(1, 4).toString(), 'PNG')
    assert.match(readFileSync(join(directory, 'og-card.svg'), 'utf8'), /Sam Example/)
    await generateAssets(data, directory)
    assert.deepEqual(readFileSync(join(directory, data.resume.file)), pdf)
    data.resume.mode = 'custom'
    const ownPdf = await PDFDocument.create()
    ownPdf.addPage()
    ownPdf.setTitle('My own résumé')
    const ownBytes = Buffer.from(await ownPdf.save())
    writeFileSync(join(directory, data.resume.file), ownBytes)
    await generateAssets(data, directory)
    assert.deepEqual(readFileSync(join(directory, data.resume.file)), ownBytes)
    data.resume.file = 'Missing.pdf'
    await assert.rejects(generateAssets(data, directory), /Custom résumé missing/)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
