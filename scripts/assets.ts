import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { PDFDocument, PDFDict, PDFName, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { Resvg } from '@resvg/resvg-js'
import { createPortfolio } from '../src/content/model.ts'

export type Portfolio = ReturnType<typeof createPortfolio>
const fontPath = resolve('assets/fonts/DejaVuSans.ttf')
export function readPortfolio(path = resolve('content/portfolio.json')) {
  let content: unknown
  try {
    content = JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    throw new Error(`Cannot read ${path}. Check that it contains valid JSON.`)
  }
  return createPortfolio(content)
}
const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
const link = (url: string, label = url.replace('https://', '')) =>
  url ? `<a href="${escape(url)}">${escape(label)}</a>` : ''

export function renderMetadata(data: Portfolio) {
  const { profile, site, appearance } = data
  return `<title>${escape(site.title)}</title>
<meta name="description" content="${escape(site.description)}" />
<link rel="canonical" href="${escape(site.url)}" />
<link rel="icon" href="${escape(appearance.favicon)}" />
<meta property="og:title" content="${escape(site.title)}" />
<meta property="og:description" content="${escape(site.description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escape(site.url)}" />
<meta property="og:image" content="${escape(new URL('/og-card.png', site.url).href)}" />
<meta property="og:image:alt" content="${escape(profile.name + ' — ' + profile.role)}" />
<meta name="twitter:card" content="summary_large_image" />`
}

export function renderProfileHtml(data: Portfolio) {
  const { profile, education, projects, skillGroups } = data
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(profile.name)} — Profile</title><style>
body{font:12px/1.6 Arial,sans-serif;color:#263025;max-width:760px;margin:30px auto;padding:0 20px}h1{font-size:34px;line-height:1.2;margin:0 0 8px}h2{font-size:16px;border-bottom:1px solid #d4dccf;padding-bottom:5px;margin:24px 0 8px}a{color:#456437}p{margin:7px 0}.role{color:#607250;font-size:16px}.links{font-size:10px}.project{break-inside:avoid;margin-bottom:15px}.foot{font-size:10px;color:#66725f;border-top:1px solid #d4dccf;padding-top:10px;margin-top:25px}@page{size:A4;margin:16mm}</style></head><body>
<h1>${escape(profile.name)}</h1><p class="role">${escape(profile.role)}</p><p>${escape(profile.location)}</p><p class="links">${[link(profile.github), link(profile.linkedin), profile.email ? `<a href="mailto:${escape(profile.email)}">${escape(profile.email)}</a>` : ''].filter(Boolean).join('<br>')}</p>
<h2>About</h2><p>${escape(profile.bio)}</p>
<h2>Education</h2><p><strong>${escape(education.degree + ' — ' + education.subject)}</strong><br>${escape(education.institution)}<br>${escape(education.university + ', ' + education.location)}<br>${escape(education.studyYear + ' · ' + education.status)}</p>
<h2>Projects</h2>${projects.map((project) => `<section class="project"><p><strong>${escape(project.name)}</strong> · ${project.tags.map(escape).join(', ')}</p><p>${escape(project.detail)}</p><p class="links">${[link(project.github), link(project.live, 'Live project')].filter(Boolean).join(' · ')}</p></section>`).join('')}
${skillGroups.map((group) => `<h2>${escape(group.title)}${group.learning ? ' — learning' : ''}</h2><p>${group.items.map(escape).join(' · ')}</p>`).join('')}
<p class="foot">${escape(profile.tagline)}</p></body></html>`
}

function wrapWords(text: string, max: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line && line.length + word.length + 1 > max) {
      lines.push(line)
      line = word
    } else line += (line ? ' ' : '') + word
  }
  if (line) lines.push(line)
  return lines
}
export function renderSocialCard(data: Portfolio) {
  const nameLines = wrapWords(data.profile.name, 28).slice(0, 2)
  const taglineLines = wrapWords(data.profile.tagline, 60).slice(0, 2)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#151815"/><g font-family="DejaVu Sans"><text x="80" y="92" font-size="22" fill="#c4f598">${escape(data.profile.handle)} / portfolio</text>${nameLines.map((line, i) => `<text x="78" y="${235 + i * 82}" font-size="76" fill="#f1f2ec">${escape(line)}</text>`).join('')}<text x="80" y="${nameLines.length > 1 ? 390 : 345}" font-size="30" fill="#c4f598">${escape(data.profile.role)}</text>${taglineLines.map((line, i) => `<text x="80" y="${450 + i * 35}" font-size="24" fill="#b0baa8">${escape(line)}</text>`).join('')}<text x="80" y="566" font-size="20" fill="#a4b09c">${escape(new URL(data.site.url).host + ' · ' + data.profile.location)}</text></g></svg>`
}

export async function createProfilePdf(data: Portfolio) {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const font = await doc.embedFont(readFileSync(fontPath), { subset: true })
  doc.setTitle(data.profile.name + ' — Profile')
  doc.setAuthor(data.profile.name)
  doc.setCreator('Portfolio profile generator')
  doc.setProducer('Portfolio profile generator')
  const info = doc.context.lookup(doc.context.trailerInfo.Info)
  if (info instanceof PDFDict) {
    info.delete(PDFName.of('CreationDate'))
    info.delete(PDFName.of('ModDate'))
  }
  let page = doc.addPage([595.28, 841.89]),
    y = 790
  const margin = 48,
    width = 499
  const ink = rgb(0.14, 0.18, 0.13),
    muted = rgb(0.34, 0.4, 0.3),
    accent = rgb(0.27, 0.4, 0.2)
  function text(value: string, size = 10, color = ink, gap = 5) {
    const lines: string[] = []
    for (const paragraph of value.split('\n')) {
      let line = ''
      for (const word of paragraph.split(/\s+/)) {
        if (font.widthOfTextAtSize((line ? line + ' ' : '') + word, size) > width && line) {
          lines.push(line)
          line = ''
        }
        if (font.widthOfTextAtSize(word, size) > width) {
          for (const char of word) {
            if (font.widthOfTextAtSize(line + char, size) > width) {
              lines.push(line)
              line = ''
            }
            line += char
          }
        } else line += (line ? ' ' : '') + word
      }
      lines.push(line)
    }
    for (const line of lines) {
      if (y - size * 1.5 < 48) {
        page = doc.addPage([595.28, 841.89])
        y = 790
      }
      page.drawText(line, { x: margin, y, font, size, color })
      y -= size * 1.55
    }
    y -= gap
  }
  function heading(value: string) {
    if (y < 100) {
      page = doc.addPage([595.28, 841.89])
      y = 790
    }
    y -= 10
    text(value, 13, accent, 5)
  }
  text(data.profile.name, 25, ink, 7)
  text(data.profile.role, 12, accent)
  text(data.profile.location, 10, muted)
  for (const value of [data.profile.email, data.profile.github, data.profile.linkedin].filter(
    Boolean,
  ))
    text(value, 8, muted, 1)
  heading('About')
  text(data.profile.bio)
  heading('Education')
  text(`${data.education.degree} — ${data.education.subject}`, 11)
  text(
    `${data.education.institution}\n${data.education.university}, ${data.education.location}\n${data.education.studyYear} · ${data.education.status}`,
    10,
    muted,
  )
  heading('Projects')
  for (const project of data.projects) {
    text(project.name + (project.tags.length ? ' · ' + project.tags.join(', ') : ''), 11)
    text(project.detail)
    for (const url of [project.github, project.live].filter(Boolean)) text(url, 8, muted, 1)
    y -= 5
  }
  for (const group of data.skillGroups) {
    heading(group.title + (group.learning ? ' — learning' : ''))
    text(group.items.join(' · '))
  }
  text(data.profile.tagline, 9, muted)
  doc.getPages().forEach((item, index) =>
    item.drawText(`${data.profile.name} · ${index + 1} / ${doc.getPageCount()}`, {
      x: margin,
      y: 25,
      font,
      size: 8,
      color: muted,
    }),
  )
  return Buffer.from(await doc.save())
}
function save(path: string, bytes: string | Buffer) {
  const next = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)
  if (existsSync(path) && readFileSync(path).equals(next)) return
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, next)
}
export async function generateAssets(data: Portfolio, output = resolve('public')) {
  mkdirSync(output, { recursive: true })
  save(join(output, 'profile.html'), renderProfileHtml(data))
  const svg = renderSocialCard(data)
  save(join(output, 'og-card.svg'), svg)
  save(
    join(output, 'og-card.png'),
    new Resvg(svg, {
      font: { fontFiles: [fontPath], loadSystemFonts: false, defaultFontFamily: 'DejaVu Sans' },
    })
      .render()
      .asPng(),
  )
  const pdfPath = join(output, data.resume.file)
  if (data.resume.mode === 'generated') save(pdfPath, await createProfilePdf(data))
  else if (!existsSync(pdfPath) || readFileSync(pdfPath).subarray(0, 5).toString() !== '%PDF-')
    throw new Error(
      `Custom résumé missing or invalid: public/${data.resume.file}. Upload a PDF in the editor or use generated mode.`,
    )
}
