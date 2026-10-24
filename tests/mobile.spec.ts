import { test, expect, type Page } from '@playwright/test'

// Touch/coarse-pointer emulation catches layout differences that viewport-only tests miss.
test.use({
  isMobile: true,
  hasTouch: true,
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
})
test.beforeEach(async ({ page }) => {
  await page.route('**/api/chat', (route) =>
    route.fulfill({ status: 503, json: { error: 'not_configured' } }),
  )
})
const files = [
  'home.tsx',
  'about.html',
  'projects.js',
  'skills.json',
  'journey.ts',
  'contact.css',
  'README.md',
]
const ids = ['home', 'about', 'projects', 'skills', 'journey', 'contact', 'readme']
async function openFile(page: Page, filename: string) {
  await page.getByRole('button', { name: 'Open mobile explorer', exact: true }).tap()
  await page.locator('.file-row').filter({ hasText: filename }).tap()
}
async function visibleHeight(page: Page, height: number | null) {
  await page.evaluate((value) => {
    const viewport = window.visualViewport!
    if (value === null) delete (viewport as unknown as { height?: number }).height
    else Object.defineProperty(viewport, 'height', { configurable: true, value })
    viewport.dispatchEvent(new Event('resize'))
  }, height)
  // Let the browser paint the resized visual viewport before measuring controls.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )
}

test('explorer scrolls without overlapping its outline and keeps a visible close button', async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 640 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.getByRole('button', { name: 'Open mobile explorer', exact: true }).tap()
    const explorer = page.getByRole('complementary', { name: 'File explorer' })
    await explorer.locator('.explorer-scroll').evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    const metrics = await explorer.evaluate((el) => {
      const scroll = el.querySelector('.explorer-scroll')!
      const outline = el.querySelector('.outline-section')!.getBoundingClientRect()
      const invite = el.querySelector('.guide-invite')!.getBoundingClientRect()
      const signature = el.querySelector('.sidebar-signature')!.getBoundingClientRect()
      const lastLink = el
        .querySelector('.explorer-bottom > button:last-of-type')!
        .getBoundingClientRect()
      return {
        scrollable: scroll.scrollHeight > scroll.clientHeight,
        outlineAfterInvite: outline.top >= invite.bottom,
        signatureAfterLinks: signature.top >= lastLink.bottom,
        footerFits: signature.bottom <= scroll.getBoundingClientRect().bottom + 1,
      }
    })
    expect(metrics, JSON.stringify(viewport)).toEqual({
      scrollable: true,
      outlineAfterInvite: true,
      signatureAfterLinks: true,
      footerFits: true,
    })
    await expect(
      explorer.getByRole('button', { name: 'Close explorer', exact: true }),
    ).toBeInViewport()
    await explorer.getByRole('button', { name: 'Close explorer', exact: true }).tap()
    await expect(explorer).toHaveCount(0)
  }
})

test('seven open tabs retain square close targets, readable labels, and a visible active tab', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')
  for (let i = 0; i < files.length; i++) {
    await openFile(page, files[i])
    await expect(page.locator('#tab-' + ids[i])).toHaveAttribute('aria-current', 'page')
  }
  await expect(page.locator('.editor-tab')).toHaveCount(7)
  const metrics = await page.locator('.editor-tabs').evaluate((strip) => {
    const active = strip.querySelector('.active')!.getBoundingClientRect()
    const box = strip.getBoundingClientRect()
    return {
      scrollable: strip.scrollWidth > strip.clientWidth,
      activeVisible: active.left >= box.left - 1 && active.right <= box.right + 1,
      tabs: [...strip.querySelectorAll('.editor-tab')].map((tab) => {
        const close = tab.querySelector('.tab-close')!.getBoundingClientRect()
        const label = tab.querySelector('.tab-label')!.getBoundingClientRect()
        const icon = tab.querySelector('.tab-close svg')!.getBoundingClientRect()
        return {
          square: close.width === 40 && close.height === 40,
          labelFits: label.right <= close.left + 1,
          iconCentered: Math.abs(close.left + close.width / 2 - (icon.left + icon.width / 2)) < 1,
        }
      }),
    }
  })
  expect(metrics.scrollable).toBe(true)
  expect(metrics.activeVisible).toBe(true)
  expect(metrics.tabs).toEqual(
    Array.from({ length: 7 }, () => ({ square: true, labelFits: true, iconCentered: true })),
  )
  await page.getByRole('button', { name: 'Close README.md', exact: true }).tap()
  await expect(page.locator('.editor-tab')).toHaveCount(6)
  await expect(page.locator('#tab-contact')).toHaveAttribute('aria-current', 'page')
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(
    page.getByRole('button', { name: 'Open mobile explorer', exact: true }),
  ).toBeVisible()
  expect(
    await page
      .locator('.editor-tabs')
      .evaluate(
        (strip) =>
          strip.querySelector('.active')!.getBoundingClientRect().right <=
          strip.getBoundingClientRect().right + 1,
      ),
  ).toBe(true)
})

test('mobile pages and footer fit narrow, portrait, and landscape screens', async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    for (const id of ids) {
      await page.goto('/#' + id)
      await expect(page.locator('#tab-' + id)).toHaveAttribute('aria-current', 'page')
      const fits = await page.evaluate(() => {
        const main = document.querySelector('main')!
        const footer = document.querySelector('.statusbar')!.getBoundingClientRect()
        return {
          content: main.scrollWidth <= main.clientWidth + 1,
          document:
            document.documentElement.scrollWidth <= innerWidth + 1 &&
            document.documentElement.scrollHeight <= innerHeight + 1,
          footer: footer.bottom <= innerHeight + 1,
        }
      })
      expect(fits, `${JSON.stringify(viewport)} ${id}`).toEqual({
        content: true,
        document: true,
        footer: true,
      })
    }
  }
})

test('explorer actions and guide do not leave stacked mobile drawers', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open mobile explorer', exact: true }).tap()
  await page.getByRole('button', { name: 'Explorer actions', exact: true }).tap()
  await expect(page.getByRole('dialog', { name: 'Go anywhere' })).toBeVisible()
  await expect(page.locator('.explorer')).toHaveCount(0)
  await page.getByRole('button', { name: 'Close Go anywhere' }).tap()
  await expect(page.locator('#main-content')).toBeFocused()
  await page.getByRole('button', { name: 'Open mobile explorer', exact: true }).tap()
  await page.getByRole('button', { name: 'Ask about Irfan' }).tap()
  await expect(page.getByRole('complementary', { name: 'Portfolio guide' })).toBeVisible()
  await expect(page.locator('.explorer')).toHaveCount(0)
  await page.getByRole('button', { name: 'Close portfolio guide' }).tap()
  await expect(page.locator('.sidebar-scrim')).toHaveCount(0)
})

test('search and guide inputs remain reachable during a simulated phone keyboard resize', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mobile command palette' }).tap()
  await visibleHeight(page, 330)
  await expect(page.locator('.app-shell')).toHaveCSS('height', '330px')
  const dialog = page.getByRole('dialog', { name: 'Go anywhere' })
  expect(
    (await dialog.boundingBox())!.y + (await dialog.boundingBox())!.height,
  ).toBeLessThanOrEqual(330)
  await expect(dialog.getByRole('textbox')).toHaveCSS('font-size', '16px')
  await dialog.getByRole('textbox').fill('settings')
  await dialog.getByRole('button', { name: /Open settings/ }).tap()
  await expect(page.getByRole('dialog', { name: 'Make yourself at home' })).toBeVisible()
  await page.getByRole('button', { name: 'Close Make yourself at home' }).tap()
  await visibleHeight(page, null)
  await expect(page.locator('.app-shell')).toHaveCSS('height', '844px')
  await page.getByRole('button', { name: 'Open mobile explorer', exact: true }).tap()
  await page.getByRole('button', { name: 'Ask about Irfan' }).tap()
  await visibleHeight(page, 330)
  const guide = page.getByRole('complementary', { name: 'Portfolio guide' })
  const input = await guide.getByRole('textbox').boundingBox()
  expect(input!.y + input!.height).toBeLessThanOrEqual(330)
  expect((await guide.getByRole('log').boundingBox())!.height).toBeGreaterThan(40)
})

test('terminal stays usable on a short phone screen without hiding the page or footer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 740, height: 360 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Mobile command palette' }).tap()
  await page.getByRole('textbox', { name: 'Search files and commands' }).fill('terminal')
  await page.getByRole('button', { name: /^Toggle terminal/ }).tap()
  const input = page.getByRole('textbox', { name: 'Terminal command' })
  await expect(input).toHaveCSS('font-size', '16px')
  await input.fill('whoami')
  await input.press('Enter')
  await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('Irfan Ahmad')
  await page.getByRole('button', { name: 'Expand terminal' }).tap()
  expect((await page.locator('main').boundingBox())!.height).toBeGreaterThan(20)
  const footer = (await page.locator('.statusbar').boundingBox())!
  expect(footer.y + footer.height).toBeLessThanOrEqual(360)
  await page.getByRole('button', { name: 'Close terminal', exact: true }).tap()
  await expect(input).not.toBeVisible()
})
