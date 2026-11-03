import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const outDir = path.resolve('docs/verification-media')
await mkdir(outDir, { recursive: true })
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11'],
})
const context = await browser.newContext({
  viewport: { width: 960, height: 600 },
  recordVideo: { dir: outDir, size: { width: 960, height: 600 } },
})
const page = await context.newPage()

try {
  await page.goto(process.env.BASE_URL ?? 'http://127.0.0.1:4173/', { waitUntil: 'commit' })
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 60000 })
  await page.evaluate(() => window.scrollTo(0, 4 * window.innerHeight))
  await page.waitForFunction(() => {
    const progress = Number(document.querySelector('[data-testid="journey"]')?.getAttribute('data-scene-progress'))
    return Math.abs(progress - 0.8) < 0.003
  }, undefined, { timeout: 45000 })
  await page.waitForTimeout(7600)
  const video = page.video()
  await context.close()
  if (video) await rename(await video.path(), path.join(outDir, 'cmm-cycle-raw-960x600.webm'))
} finally {
  await browser.close()
}
