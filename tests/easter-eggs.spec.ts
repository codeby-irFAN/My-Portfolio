import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import content from '../content/portfolio.json' with { type: 'json' }

async function command(page: Page, text: string) {
  const input = page.getByRole('textbox', { name: 'Terminal command' })
  await input.fill(text)
  await input.press('Enter')
}
async function unlockNote(page: Page) {
  const logo = page.getByRole('button', { name: 'Go home', exact: true })
  for (let i = 0; i < 5; i++) await logo.click()
}

test('coffee animates in the terminal and hiring leads to actual contact options without network calls', async ({
  page,
}) => {
  const apiRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/')) apiRequests.push(request.url())
  })
  await page.goto('/')
  await page.keyboard.press('Control+`')
  await command(page, 'coffee')
  const coffee = page.locator('.coffee-egg')
  await expect(coffee).toContainText('Turning caffeine into questionable variable names.')
  await expect(coffee.locator('.coffee-steam')).toHaveCSS('animation-name', 'coffee-steam')
  await expect(page.locator('.terminal-panel')).toHaveClass(/expanded/)
  await command(page, 'sudo hire someone-else')
  await expect(page.locator('.hire-egg')).toHaveCount(0)
  await command(page, 'sudo hire irfan')
  const hire = page.locator('.hire-egg')
  await expect(hire).toContainText('Permission granted.')
  await expect(hire.getByRole('link', { name: content.profile.email })).toHaveAttribute(
    'href',
    `mailto:${content.profile.email}`,
  )
  await expect(hire.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    content.profile.linkedin,
  )
  await hire.getByRole('button', { name: 'Open contact.css' }).click()
  await expect(page).toHaveURL(/#contact$/)
  await expect(page.getByRole('form', { name: 'Email Irfan' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Terminal command' })).toBeHidden()
  expect(apiRequests).toEqual([])
})

test('five logo clicks unlock the note, normal home navigation remains, and old clicks expire', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/#about')
  const logo = page.getByRole('button', { name: 'Go home', exact: true })
  await logo.click()
  await expect(page).toHaveURL(/#home$/)
  for (let i = 0; i < 3; i++) await logo.click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.clock.fastForward(4001)
  await logo.click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  for (let i = 0; i < 4; i++) await logo.click()
  const note = page.getByRole('dialog', { name: content.easterEggs.noteTitle })
  await expect(note).toBeVisible()
  await expect(note).toContainText('Hey, I’m Irfan.')
  await expect(note).toContainText('TraceRisk and Team Board')
  const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(
    a11y.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.failureSummary) })),
  ).toEqual([])
  await page.keyboard.press('Escape')
  await expect(note).toHaveCount(0)
  await expect(logo).toBeFocused()
  // Keyboard activation uses the same button; the secret is not pointer-only.
  for (let i = 0; i < 5; i++) await page.keyboard.press('Enter')
  await expect(note).toBeVisible()
  await note.getByRole('button', { name: 'Back to exploring' }).click()
  await expect(note).toHaveCount(0)
})

test('matrix leaves navigation usable, supports exits and toggling, and cleans up each 10-second timer', async ({
  page,
}) => {
  await page.clock.install()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.keyboard.press('Control+`')
  const theme = await page.locator('html').getAttribute('data-theme')
  await command(page, 'matrix')
  await expect(page.locator('.matrix-overlay')).toBeVisible()
  await expect(page.locator('.matrix-column').first()).toHaveCSS('animation-name', 'matrix-fall')
  await page.locator('.file-row').filter({ hasText: 'projects.js' }).click()
  await expect(page).toHaveURL(/#projects$/)
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme!)
  await page.clock.fastForward(2000)
  await page.getByRole('button', { name: 'Exit matrix', exact: true }).click()
  await expect(page.locator('.matrix-overlay')).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: 'Terminal command' })).toBeFocused()
  await command(page, 'matrix')
  await expect(page.locator('.matrix-overlay')).toBeVisible()
  await page.clock.fastForward(8500)
  await expect(page.locator('.matrix-overlay')).toBeVisible()
  await page.clock.fastForward(1501)
  await expect(page.locator('.matrix-overlay')).toHaveCount(0)
  await command(page, 'matrix')
  await command(page, 'matrix')
  await expect(page.locator('.matrix-overlay')).toHaveCount(0)
  await command(page, 'matrix')
  await page.keyboard.press('Escape')
  await expect(page.locator('.matrix-overlay')).toHaveCount(0)
  await command(page, 'matrix')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.matrix-controls')).toContainText('still mode')
  await expect(page.locator('.matrix-column').first()).toHaveCSS('animation-name', 'none')
  await page.getByRole('button', { name: 'Exit matrix', exact: true }).click()
})

test('editable messages follow the profile, and the owner can disable every Easter egg', async ({
  page,
}) => {
  const next = structuredClone(content)
  next.profile.name = 'Sam Example'
  next.easterEggs.coffeeMessage = 'One coffee for {firstName}.'
  next.easterEggs.noteTitle = 'My secret note'
  next.easterEggs.noteMessage = 'Hello from {firstName}.'
  await page.route('**/content/portfolio.json*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `export default ${JSON.stringify(next)}`,
    }),
  )
  await page.goto('/')
  await page.keyboard.press('Control+`')
  await command(page, 'coffee')
  await expect(page.locator('.coffee-egg')).toContainText('One coffee for Sam.')
  await command(page, 'sudo hire sam')
  await expect(page.locator('.hire-egg')).toContainText('Permission granted.')
  await unlockNote(page)
  const note = page.getByRole('dialog', { name: 'My secret note' })
  await expect(note).toContainText('Hello from Sam.')
  await page.keyboard.press('Escape')
  next.easterEggs.enabled = false
  await page.reload()
  await unlockNote(page)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.keyboard.press('Control+`')
  for (const text of ['coffee', 'sudo hire sam', 'matrix']) await command(page, text)
  await expect(page.locator('.coffee-egg, .hire-egg, .matrix-overlay')).toHaveCount(0)
  await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText(
    'Command not found: matrix',
  )
})

test.describe('phone Easter eggs', () => {
  test.use({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 320, height: 568 },
    reducedMotion: 'reduce',
  })
  test('logo taps, contact cards, and still Matrix fit a narrow touch screen', async ({ page }) => {
    await page.goto('/')
    const logo = page.getByRole('button', { name: 'Go home', exact: true })
    for (let i = 0; i < 5; i++) await logo.tap()
    const note = page.getByRole('dialog', { name: content.easterEggs.noteTitle })
    await expect(note).toBeVisible()
    expect(await note.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
    await note.getByRole('button', { name: `Close ${content.easterEggs.noteTitle}` }).tap()
    await page.getByRole('button', { name: 'Mobile command palette' }).tap()
    await page.getByRole('textbox', { name: 'Search files and commands' }).fill('terminal')
    await page.getByRole('button', { name: /^Toggle terminal/ }).tap()
    await command(page, 'coffee')
    await expect(page.locator('.coffee-steam')).toHaveCSS('animation-name', 'none')
    await command(page, 'sudo hire irfan')
    const panel = page.getByRole('region', { name: 'Portfolio terminal' })
    expect(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
    await command(page, 'matrix')
    await expect(page.locator('.matrix-controls')).toContainText('still mode')
    await expect(page.getByRole('button', { name: 'Exit matrix', exact: true })).toBeInViewport()
    await expect(page.locator('.matrix-column').first()).toHaveCSS('animation-name', 'none')
    await page.getByRole('button', { name: 'Exit matrix', exact: true }).tap()
    await expect(page.locator('.matrix-overlay')).toHaveCount(0)
    const a11y = await new AxeBuilder({ page })
      .include('.terminal-panel')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(
      a11y.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.failureSummary) })),
    ).toEqual([])
    await page.screenshot({ path: '/tmp/portfolio-easter-eggs-mobile.png' })
  })
})
