import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { startEditor } from '../editor/server.ts'
import content from '../content/portfolio.json' with { type: 'json' }

test('owner edits profile and AI personality, adds a project, saves, and reopens the local editor', async ({
  page,
}) => {
  const root = mkdtempSync(join(tmpdir(), 'portfolio-editor-browser-'))
  mkdirSync(join(root, 'content'))
  writeFileSync(join(root, 'content/portfolio.json'), JSON.stringify(content))
  const editor = await startEditor({ root, port: 0, previewUrl: 'http://127.0.0.1:5173/' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.goto(editor.url)
    await page.getByLabel('Name', { exact: true }).fill('Sam Example')
    await page.getByRole('button', { name: 'AI personality', exact: true }).click()
    await page.getByLabel('Personality', { exact: true }).fill('Warm, witty, and concise.')
    await page
      .getByLabel('Instructions', { exact: true })
      .fill('Explain my work in simple terms. Ask a helpful follow-up question.')
    await page.getByLabel('Maximum reply words').fill('120')
    await page.getByRole('button', { name: 'Projects', exact: true }).click()
    await page.locator('#fields > div > button.add').click()
    const project = page.locator('#fields > div > section').last()
    await project.getByLabel('Unique project ID').fill('new-project')
    await project.getByLabel('Name', { exact: true }).fill('New Project')
    await project.getByLabel('Description', { exact: true }).fill('A useful tool for students.')
    await project.getByLabel('Category', { exact: true }).fill('Design')
    await expect(project.getByLabel('Preview style')).toHaveValue('auto')
    await page.getByRole('button', { name: 'Save changes', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Saved locally.')
    const saved = JSON.parse(readFileSync(join(root, 'content/portfolio.json'), 'utf8'))
    expect(saved.profile.name).toBe('Sam Example')
    expect(saved.assistant.personality).toBe('Warm, witty, and concise.')
    expect(saved.assistant.maxWords).toBe(120)
    expect(saved.projects.at(-1).name).toBe('New Project')
    expect(readFileSync(join(root, 'public/profile.html'), 'utf8')).toContain('Sam Example')
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 850 })
      await page.getByRole('button', { name: 'AI personality', exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(a11y.violations.map((v) => v.id)).toEqual([])
    }
    await page.reload()
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Sam Example')
    await page.getByRole('button', { name: 'AI personality', exact: true }).click()
    await expect(page.getByLabel('Personality', { exact: true })).toHaveValue(
      'Warm, witty, and concise.',
    )
    await page.screenshot({ path: '/tmp/portfolio-editor.png', fullPage: true })
    expect(errors).toEqual([])
  } finally {
    await page.goto('about:blank').catch(() => {})
    await editor.close()
    rmSync(root, { recursive: true, force: true })
  }
})

test('new content reaches portfolio pages, categories, terminal, and offline guide', async ({
  page,
}) => {
  const next = structuredClone(content)
  next.profile.name = 'Sam Example'
  next.education.studyYear = 'third-year'
  next.assistant.welcome = 'Hello! Ask about {firstName}.'
  next.assistant.personality = 'Warm and concise.'
  next.extraAnswers = [
    { terms: ['availability'], text: '{firstName} welcomes project discussions.', page: 'contact' },
  ] as never
  next.projects.push({
    ...next.projects[0],
    id: 'new-project',
    name: 'New Project',
    category: 'Design',
    preview: 'auto',
    image: '',
    github: '',
    live: '',
  })
  await page.route('**/content/portfolio.json*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `export default ${JSON.stringify(next)}`,
    }),
  )
  await page.route('**/api/chat', (route) =>
    route.fulfill({ status: 503, json: { error: 'not_configured' } }),
  )
  await page.goto('/')
  await expect(page).toHaveTitle(/Sam Example/)
  await expect(page.locator('.hero h1')).toContainText('Sam')
  await page.goto('/#about')
  await expect(page.locator('.about-text')).toContainText('third-year')
  await page.goto('/#projects')
  await expect(page.getByRole('button', { name: 'All 03', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Design', exact: true }).click()
  await expect(page.locator('.full-projects .project-card')).toHaveCount(1)
  await expect(page.locator('.full-projects')).toContainText('New Project')
  await expect(page.locator('.project-auto-visual')).toContainText('New Project')
  await page.getByRole('button', { name: 'Open portfolio guide', exact: true }).click()
  const guide = page.getByRole('complementary', { name: 'Portfolio guide' })
  await expect(guide.getByRole('log')).toContainText('Hello! Ask about Sam.')
  await guide.getByRole('textbox').fill('Any availability?')
  await guide.getByRole('button', { name: 'Send question' }).click()
  await expect(guide.getByRole('log')).toContainText('Sam welcomes project discussions.')
  await guide.getByRole('button', { name: 'Close portfolio guide' }).click()
  await page.keyboard.press('Control+`')
  await page.getByRole('textbox', { name: 'Terminal command' }).fill('whoami')
  await page.getByRole('textbox', { name: 'Terminal command' }).press('Enter')
  await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('Sam Example')
})
