import { expect, test } from '@playwright/test'

const routes = ['/', '/products', '/about', '/contact']
const nav = [
  { name: '產品與服務', path: '/products' },
  { name: '關於我們', path: '/about' },
  { name: '聯絡詢價', path: '/contact' },
  { name: '首頁', path: '/' },
]

for (const viewport of [
  { width: 360, height: 800 },
  { width: 1440, height: 900 },
]) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport })

    test('four routes have no horizontal overflow', async ({ page }) => {
      for (const route of routes) {
        await page.goto(route, { waitUntil: 'commit' })
        await page.waitForSelector('header')
        const fits = await page.evaluate(() => {
          const root = document.documentElement
          return root.scrollWidth <= root.clientWidth
        })
        expect(fits, route).toBe(true)
      }
    })

    test('navigation links change the route', async ({ page }) => {
      test.setTimeout(60000)
      await page.goto('/', { waitUntil: 'commit' })
      await page.waitForSelector('header')
      const menu = page.getByRole('navigation', { name: '主要' })
      for (const item of nav) {
        if (viewport.width < 800) {
          await page.getByRole('button', { name: '開啟選單' }).click()
        }
        await menu.getByRole('link', { name: item.name, exact: true }).click()
        if (item.path === '/') await expect(page).toHaveURL(/\/$/)
        else await expect(page).toHaveURL(new RegExp(`${item.path}$`))
      }
    })

    test('wheel completes a station transition without overlapping copy', async ({ page }) => {
      test.setTimeout(90000)
      await page.goto('/', { waitUntil: 'commit' })
      const journey = page.getByTestId('journey')
      await expect(journey).toHaveAttribute('data-scroll-ready', 'true', { timeout: 20000 })
      await expect(journey).toHaveAttribute('data-scene-progress', /^\d/, { timeout: 30000 })
      await page.evaluate(() => window.dispatchEvent(new WheelEvent('wheel', { deltaY: 650, cancelable: true })))
      const journeyOffset = () => page.evaluate(() => -document.querySelector('[data-testid="journey"]')!.getBoundingClientRect().top)
      await expect.poll(journeyOffset, { timeout: 12000 }).toBeGreaterThan(viewport.height - 5)
      await expect.poll(journeyOffset, { timeout: 12000 }).toBeLessThan(viewport.height + 5)
      await expect(page.locator('[data-testid^="journey-card-"]:visible')).toHaveCount(1)
      await expect(page.getByTestId('journey-card-gate')).toHaveAttribute('aria-hidden', 'false')

      await page.waitForTimeout(300)
      await page.evaluate(() => window.dispatchEvent(new WheelEvent('wheel', { deltaY: 650, cancelable: true })))
      await expect.poll(journeyOffset, { timeout: 12000 }).toBeGreaterThan(viewport.height * 2 - 5)
      await expect(page.getByTestId('journey-card-cnc')).toHaveAttribute('aria-hidden', 'false')

      await page.waitForTimeout(300)
      await page.evaluate(() => window.dispatchEvent(new WheelEvent('wheel', { deltaY: -650, cancelable: true })))
      await expect.poll(journeyOffset, { timeout: 12000 }).toBeLessThan(viewport.height + 5)
      await expect(page.getByTestId('journey-card-gate')).toHaveAttribute('aria-hidden', 'false')

      if (viewport.width >= 800) {
        await page.getByRole('group', { name: '旅程站點' }).getByRole('button').nth(5).click()
        await expect(page.getByTestId('journey-card-ship')).toHaveAttribute('aria-hidden', 'false', { timeout: 12000 })
      }

      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 5))
      await expect(page.getByTestId('journey-card-ship')).toHaveAttribute('aria-hidden', 'false', { timeout: 12000 })
    })

    test('touch release settles to one station', async ({ page }) => {
      if (viewport.width >= 800) test.skip()
      test.setTimeout(90000)
      await page.goto('/', { waitUntil: 'commit' })
      const journey = page.getByTestId('journey')
      await expect(journey).toHaveAttribute('data-scroll-ready', 'true', { timeout: 20000 })
      await expect(journey).toHaveAttribute('data-scene-progress', /^\d/, { timeout: 30000 })
      await page.evaluate(() => {
        window.dispatchEvent(new Event('touchstart'))
        window.scrollTo(0, window.innerHeight * 2.42)
        window.dispatchEvent(new Event('touchend'))
      })
      await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 30000 }).toBeLessThan(viewport.height * 2 + 5)
      await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 30000 }).toBeGreaterThan(viewport.height * 2 - 5)
      await expect(page.locator('[data-testid^="journey-card-"]:visible')).toHaveCount(1)
    })

    test('reduced motion exposes the static six-station story', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/', { waitUntil: 'commit' })
      await expect(page.locator('canvas')).toHaveCount(0)
      await expect(page.locator('[data-testid^="journey-card-"]')).toHaveCount(0)
      await expect(page.getByTestId('static-journey-card')).toHaveCount(6)
    })

    test('entrance shutter opens over time before the first stop settles', async ({ page }) => {
      test.setTimeout(60000)
      await page.goto('/', { waitUntil: 'commit' })
      const journey = page.getByTestId('journey')
      await expect(journey).toHaveAttribute('data-scroll-ready', 'true', { timeout: 20000 })
      await expect.poll(async () => Number(await journey.getAttribute('data-door-open')), { timeout: 20000 }).toBeLessThan(0.02)

      const start = Date.now()
      await page.evaluate(() => window.dispatchEvent(new WheelEvent('wheel', { deltaY: 650, cancelable: true })))
      const immediate = Number(await journey.getAttribute('data-door-open'))
      expect(immediate).toBeLessThan(0.9)
      await expect.poll(async () => Number(await journey.getAttribute('data-door-open')), { timeout: 30000 }).toBeGreaterThan(0.98)
      expect(Date.now() - start).toBeGreaterThan(300)
      await expect(page.getByTestId('journey-card-gate')).toHaveAttribute('aria-hidden', 'false')
      await expect(page.locator('[data-testid^="journey-card-"]:visible')).toHaveCount(1)
    })

    test('camera wakes after a stationary pause', async ({ page }) => {
      test.setTimeout(100000)
      await page.goto('/', { waitUntil: 'commit' })
      const journey = page.getByTestId('journey')
      await expect(journey).toHaveAttribute('data-scene-progress', /^\d/, { timeout: 30000 })
      await page.evaluate(() => window.scrollTo(0, window.innerHeight))
      await expect.poll(async () => Number(await journey.getAttribute('data-scene-progress')), { timeout: 30000 }).toBeGreaterThan(0.195)
      await page.waitForTimeout(3800)
      await page.evaluate(() => window.dispatchEvent(new WheelEvent('wheel', { deltaY: -650, cancelable: true })))
      await expect.poll(async () => Number(await journey.getAttribute('data-scene-progress')), { timeout: 30000 }).toBeLessThan(0.005)
      await expect(page.getByTestId('journey-card-exterior')).toHaveAttribute('aria-hidden', 'false')
      await expect(page.locator('[data-testid^="journey-card-"]:visible')).toHaveCount(1)
    })

    test('empty contact submit shows required errors and does not pretend success', async ({ page }) => {
      await page.goto('/contact', { waitUntil: 'commit' })
      await page.waitForSelector('header')
      await page.getByRole('button', { name: '送出詢問' }).click()
      await expect(page.getByText('請填寫此欄位').first()).toBeVisible()
      await expect(page.getByTestId('form-notice')).toHaveCount(0)
      await expect(page.getByText('已成功')).toHaveCount(0)
      await expect(page.getByText('送出成功')).toHaveCount(0)

      await page.locator('#field-company').fill('北嶺試作所（示意）')
      await page.locator('#field-name').fill('林示範')
      await page.locator('#field-email').fill('not-an-email')
      await page.locator('#field-phone').fill('12345')
      await page.locator('#field-subject').fill('軸心打樣（示意）')
      await page.locator('#field-message').fill('數量 2，公差依圖（示意）')
      await page.getByRole('button', { name: '送出詢問' }).click()
      await expect(page.getByText('請輸入有效的 Email')).toBeVisible()
      await expect(page.getByText('請輸入有效的電話（例如 04-2000-0000）')).toBeVisible()
      await expect(page.getByTestId('form-notice')).toHaveCount(0)

      await page.locator('#field-email').fill('qa@fineform.example')
      await page.locator('#field-phone').fill('04-2000-0000')
      await page.getByRole('button', { name: '送出詢問' }).click()
      await expect(page.getByTestId('form-notice')).toHaveText('表單串接將於第 2 步完成，目前尚未送出')
      await expect(page.getByText('已成功')).toHaveCount(0)
      await expect(page.getByText('送出成功')).toHaveCount(0)
    })
  })
}
