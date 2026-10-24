import { chromium } from '@playwright/test'
import { existsSync, writeFileSync } from 'node:fs'
import { profile, projects, skillGroups } from '../src/data.ts'
const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
const link = (url, label = url.replace('https://', '')) =>
  `<a href="${escape(url)}">${escape(label)}</a>`
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(profile.name)} — Student Developer Profile</title><style>
body{font:11px/1.55 Arial,sans-serif;color:#263025;max-width:720px;margin:12px auto;padding:0 15px}h1{font-size:34px;line-height:1.2;margin:0 0 6px}h2{font-size:14px;border-bottom:1px solid #d4dccf;padding-bottom:5px;margin:19px 0 8px}a{color:#456437}p{margin:6px 0}.role{color:#607250;font-size:15px}.links{font-size:10px}.project{break-inside:avoid;margin-bottom:14px}.foot{font-size:9px;color:#66725f;border-top:1px solid #d4dccf;padding-top:9px;margin-top:22px}@page{size:A4;margin:16mm}</style></head><body>
<h1>${escape(profile.name)}</h1><p class="role">AI & ML Student · Aspiring Developer</p><p>${escape(profile.location)}</p><p class="links">${link(profile.github)}<br>${link(profile.linkedin)}</p>
<h2>About</h2><p>${escape(profile.bio)}</p>
<h2>Education</h2><p><strong>B.Tech — Artificial Intelligence & Machine Learning</strong><br>${escape(profile.education)}, Delhi<br>First-year student</p>
<h2>Projects</h2>${projects.map((p) => `<section class="project"><p><strong>${escape(p.name)}</strong> · ${p.tags.map(escape).join(', ')}</p><p>${escape(p.detail)}</p><p class="links">${link(p.github)} · ${link(p.live, 'Live project')}</p></section>`).join('')}
<h2>Technical Skills</h2><p>${skillGroups
  .slice(0, 2)
  .flatMap((g) => g.items)
  .map(escape)
  .join(' · ')}</p>
<h2>Currently Learning & Exploring</h2><p>${skillGroups[2].items.map(escape).join(' · ')}</p><p class="foot">${escape(profile.tagline)} · Profile based on my public GitHub information.</p></body></html>`
writeFileSync('public/profile.html', html)
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
  args: ['--no-sandbox'],
})
try {
  const page = await browser.newPage()
  await page.setContent(html)
  await page.pdf({ path: 'public/Irfan-Ahmad-Profile.pdf', format: 'A4', printBackground: true })
  console.log('Generated public/profile.html and public/Irfan-Ahmad-Profile.pdf from src/data.ts.')
} finally {
  await browser.close()
}
