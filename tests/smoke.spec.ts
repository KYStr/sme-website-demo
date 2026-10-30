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
