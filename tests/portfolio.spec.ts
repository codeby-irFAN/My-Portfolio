import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('editor navigation, file closing, browser history, and profile content', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Irfan. Ahmad' })).toBeVisible()
  for (const [file, heading] of [
    ['about.html', 'Curious by nature.'],
    ['projects.js', 'From “what if”'],
    ['skills.json', 'A few tools.'],
    ['journey.ts', 'Just getting started.'],
    ['contact.css', 'Have an idea?'],
    ['README.md', 'A portfolio with'],
  ]) {
    await page.locator('.file-row').filter({ hasText: file }).click()
    await expect(page.locator('main h1')).toContainText(heading)
  }
  await page.goBack()
  await expect(page).toHaveURL(/#contact$/)
  await page.getByRole('button', { name: 'Close contact.css', exact: true }).click()
  await expect(page.locator('#tab-contact')).toHaveCount(0)
  await expect(page.locator('main')).not.toContainText('Have an idea?')
  expect(errors).toEqual([])
})

test('project filters and details contain working destinations; dialogs trap focus', async ({
  page,
}) => {
  await page.goto('/#projects')
  await expect(page.locator('.project-card')).toHaveCount(2)
  await page.getByRole('button', { name: 'AI', exact: true }).click()
  await expect(page.locator('.project-card')).toHaveCount(1)
  await page.locator('.project-card').click()
  const dialog = page.getByRole('dialog', { name: 'TraceRisk', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Explore live project' })).toHaveAttribute(
    'href',
    'https://tracerisk.onrender.com/',
  )
  await expect(dialog.getByRole('link', { name: 'Source code' })).toHaveAttribute(
    'href',
    'https://github.com/codeby-irFAN/TraceRisk',
  )
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await page.getByRole('button', { name: 'Web', exact: true }).click()
  await expect(page.locator('.project-card')).toContainText('Team Board')
})

test('command palette keyboard navigation, terminal commands and command history', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('Control+k')
  await page.getByRole('textbox', { name: 'Search files and commands' }).fill('skills.json')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#skills$/)
  await page.keyboard.press('Control+`')
  const input = page.getByRole('textbox', { name: 'Terminal command' })
  await input.fill('whoami')
  await input.press('Enter')
  await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText('Irfan Ahmad')
  await input.fill('open proj')
  await input.press('Tab')
  await expect(input).toHaveValue('open projects.js')
  await input.press('Enter')
  await expect(page).toHaveURL(/#projects$/)
  await input.press('ArrowUp')
  await expect(input).toHaveValue('open projects.js')
  await input.fill('nonsense')
  await input.press('Enter')
  await expect(page.getByRole('log', { name: 'Terminal output' })).toContainText(
    'Command not found: nonsense',
  )
  await input.fill('clear')
  await input.press('Enter')
  await expect(page.getByRole('log', { name: 'Terminal output' })).toBeEmpty()
  await page.getByRole('button', { name: 'Close terminal', exact: true }).click()
  await expect(input).not.toBeVisible()
})

test('themes persist, cursor settings work, and guide uses real profile information', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Choose color theme' }).click()
  await page.getByRole('button', { name: 'Paper Light', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  const toggle = page.getByRole('switch', { name: 'Square cursor' })
  await expect(toggle).toHaveAttribute('aria-checked', 'true')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await page.keyboard.press('Escape')
  await page.mouse.move(600, 300)
  await expect(page.locator('body')).not.toHaveClass(/custom-cursor/)
  await page.getByRole('button', { name: 'Open portfolio guide', exact: true }).click()
  await page.getByRole('button', { name: 'What is he studying?' }).click()
  await expect(page.getByRole('log', { name: 'Guide conversation' })).toContainText('GGSIPU')
  await page.getByRole('button', { name: 'Take me there', exact: true }).click()
  await expect(page).toHaveURL(/#journey$/)
  await page.getByRole('button', { name: 'Close portfolio guide' }).click()
})

test('mobile navigation has no horizontal overflow, and reduced motion disables the custom pointer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.explorer')).toHaveCount(0)
  await page.getByRole('button', { name: 'Open mobile explorer' }).click()
  await page.locator('.file-row').filter({ hasText: 'projects.js' }).click()
  await expect(page.locator('.explorer')).toHaveCount(0)
  await expect(page.locator('.project-card')).toHaveCount(2)
  for (const id of ['home', 'about', 'projects', 'skills', 'journey', 'contact', 'readme']) {
    await page.goto('/#' + id)
    expect(
      await page.locator('main').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      id + ' should fit mobile',
    ).toBe(true)
  }
  await page.mouse.move(200, 200)
  await expect(page.locator('body')).not.toHaveClass(/custom-cursor/)
})

test('home and command dialog meet automated accessibility checks; PDF is downloadable', async ({
  page,
  request,
}) => {
  await page.goto('/')
  const home = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(
    home.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, issue: n.failureSummary })),
    })),
  ).toEqual([])
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Go anywhere' })).toHaveCSS('opacity', '1')
  const dialog = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(
    dialog.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, issue: n.failureSummary })),
    })),
  ).toEqual([])
  await page.keyboard.press('Escape')
  const pdf = await request.get('/Irfan-Ahmad-Profile.pdf')
  expect(pdf.ok()).toBe(true)
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-')
})

test('cursor dot and square stay centered on the pointer without trailing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Irfan. Ahmad' })).toBeVisible()
  const positions = await page.evaluate(() => {
    return [
      [420, 240],
      [1050, 630],
      [560, 350],
    ].map(([x, y]) => {
      document.querySelector('main')!.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerType: 'mouse',
          clientX: x,
          clientY: y,
        }),
      )
      const ring = new DOMMatrix(
        getComputedStyle(document.querySelector('.square-cursor')!).transform,
      )
      const dot = new DOMMatrix(getComputedStyle(document.querySelector('.cursor-dot')!).transform)
      return { expected: [x, y], ring: [ring.m41, ring.m42], dot: [dot.m41, dot.m42] }
    })
  })
  for (const position of positions) {
    expect(position.ring).toEqual(position.expected)
    expect(position.dot).toEqual(position.expected)
  }
  const dot = await page.locator('.cursor-dot').evaluate((el) => {
    const style = getComputedStyle(el, '::before')
    return {
      width: style.width,
      height: style.height,
      radius: style.borderRadius,
      left: style.left,
      top: style.top,
    }
  })
  expect(dot).toEqual({ width: '8px', height: '8px', radius: '0px', left: '-4px', top: '-4px' })
  await page.getByRole('button', { name: 'Explore my work', exact: true }).hover()
  await expect(page.locator('.square-cursor')).toHaveClass(/is-hovering/)
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect(page.locator('.square-cursor')).toHaveCSS('opacity', '0')
  await expect(page.locator('.cursor-dot')).toHaveCSS('opacity', '0')
})

test('menus, scrolling, command actions, downloads, and contact copy work', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  await page.getByRole('button', { name: 'SCROLL TO EXPLORE', exact: true }).click()
  await expect.poll(() => page.locator('main').evaluate((el) => el.scrollTop)).toBeGreaterThan(200)
  await page.getByRole('button', { name: 'File', exact: true }).click()
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download profile', exact: true }).click()
  expect((await downloading).suggestedFilename()).toBe('Irfan-Ahmad-Profile.pdf')
  await page.getByRole('button', { name: 'View', exact: true }).click()
  await page.getByRole('button', { name: 'Color theme…', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Change the atmosphere' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+k')
  await page.getByRole('textbox', { name: 'Search files and commands' }).fill('theme')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Change the atmosphere' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.locator('.file-row').filter({ hasText: 'contact.css' }).click()
  await page.getByRole('button', { name: 'Copy profile link' }).click()
  await expect(page.getByRole('status')).toContainText('GitHub profile link copied.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'https://github.com/codeby-irFAN',
  )
})
