import { expect, test } from '@playwright/test'

const adminKey = 'playwright-admin-key'

async function fillInquiry(page: import('@playwright/test').Page, company = '北嶺試作所（示意）') {
  await page.locator('#field-company').fill(company)
  await page.locator('#field-name').fill('林示範')
  await page.locator('#field-email').fill('qa@fineform.example')
  await page.locator('#field-phone').fill('04-2000-0000')
  await page.locator('#field-subject').fill('軸心打樣（示意）')
  await page.locator('#field-message').fill('數量 2，公差依圖（示意）')
}

test('online submit shows a real ticket and a double click stays one row', async ({ page }) => {
  test.setTimeout(60000)
  await page.goto('/contact')
  await expect(page.getByTestId('contact-form')).toHaveAttribute('data-api', 'online')
  await fillInquiry(page, '連點試作所（示意）')
  await page.getByRole('button', { name: '送出詢問' }).dblclick()
  await expect(page.getByTestId('form-notice')).toContainText(/FF-\d{4}-\d{4,}/)

  const listed = await fetch(`http://127.0.0.1:3001/api/inquiries?q=${encodeURIComponent('連點試作所')}`, {
    headers: { authorization: `Bearer ${adminKey}` },
  })
  const body = (await listed.json()) as { total: number }
  expect(body.total).toBe(1)
})

test('server field errors land on the matching input', async ({ page }) => {
  test.setTimeout(60000)
  await page.route('**/api/inquiries', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({
        error: { code: 'validation_failed', message: '請修正標示的欄位', fields: { email: 'invalid_email' } },
        requestId: 'e2e',
      }),
    })
  })
  await page.goto('/contact')
  await expect(page.getByTestId('contact-form')).toHaveAttribute('data-api', 'online')
  await fillInquiry(page)
  await page.getByRole('button', { name: '送出詢問' }).click()
  await expect(page.getByText('請輸入有效的 Email')).toBeVisible()
  await expect(page.locator('#field-email')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByTestId('form-notice')).toHaveCount(0)
})

test('an HTML health response is treated as no backend', async ({ page }) => {
  await page.route('**/api/health', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body>fallback</body></html>',
    })
  })
  await page.goto('/contact')
  await expect(page.getByTestId('form-offline')).toContainText('目前連不上詢價服務，表單沒有送出')
  await expect(page.getByRole('link', { name: '改用電子郵件' })).toHaveAttribute('href', /^mailto:contact@fineform\.example/)
  await expect(page.getByTestId('form-notice')).toHaveCount(0)
})

test('rate limit keeps the draft and explains when to retry', async ({ page }) => {
  test.setTimeout(60000)
  await page.route('**/api/inquiries', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    await route.fulfill({
      status: 429,
      headers: { 'retry-after': '600', 'content-type': 'application/json' },
      body: JSON.stringify({
        error: { code: 'rate_limited', message: '送出次數已達上限，約 10 分鐘後可以再試（600 秒）。這筆還沒有送出' },
        requestId: 'e2e',
      }),
    })
  })
  await page.goto('/contact')
  await expect(page.getByTestId('contact-form')).toHaveAttribute('data-api', 'online')
  await fillInquiry(page, '限流試作所（示意）')
  await page.getByRole('button', { name: '送出詢問' }).click()
  await expect(page.getByTestId('form-rate-limit')).toContainText('600 秒')
  await expect(page.getByRole('link', { name: '改用電子郵件' })).toBeVisible()
  await expect(page.locator('#field-company')).toHaveValue('限流試作所（示意）')
})

test('admin list hides contact details until a record is opened', async ({ page }) => {
  test.setTimeout(60000)
  let dialog = false
  page.on('dialog', () => {
    dialog = true
  })
  await page.goto('/admin')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  await expect(page.getByLabel('管理金鑰')).toBeVisible()
  await expect(page.getByText('龍井打樣行（示意）')).toHaveCount(0)

  await page.getByLabel('管理金鑰').fill('wrong-key-value!!')
  await page.getByRole('button', { name: '進入列表' }).click()
  await expect(page.getByText('管理金鑰不正確')).toBeVisible()

  await page.getByLabel('管理金鑰').fill(adminKey)
  await page.getByRole('button', { name: '進入列表' }).click()
  await expect(page.getByText('b***@workshop12.example')).toBeVisible()
  await expect(page.getByText('buyer12@workshop12.example')).toHaveCount(0)
  await expect(page.getByText('示意資料').first()).toBeVisible()

  await page.getByRole('link', { name: 'FF-2026-0003' }).click()
  await expect(page.getByText('buyer04@workshop04.example')).toBeVisible()
  await expect(page.getByText("<script>alert('xss')</script>", { exact: false })).toBeVisible()
  expect(dialog).toBe(false)

  await page.getByRole('button', { name: '標為已讀' }).click()
  await expect(page.getByText('已讀', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('已讀', { exact: true })).toBeVisible()
})

test('admin list stays inside a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/admin')
  await page.getByLabel('管理金鑰').fill(adminKey)
  await page.getByRole('button', { name: '進入列表' }).click()
  await expect(page.getByRole('link', { name: 'FF-2026-0011' })).toBeVisible()
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)
  expect(fits).toBe(true)
})
