import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const outFile = path.resolve('docs/verification-media/motion-check.json')
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11'],
})
const stations = [
  { index: 2, name: 'cnc', moving: true },
  { index: 3, name: 'sample-rack', moving: false },
  { index: 4, name: 'cmm', moving: true },
]
const results = []

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    const page = await browser.newPage({ viewport })
    const pageErrors = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.goto(baseURL, { waitUntil: 'commit' })
    const canvas = page.locator('canvas').first()
    await canvas.waitFor({ state: 'visible', timeout: 60000 })
    const renderer = await canvas.evaluate((element) => {
      const context = element.getContext('webgl2') ?? element.getContext('webgl')
      const extension = context?.getExtension('WEBGL_debug_renderer_info')
      return context && extension ? context.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unknown'
    })

    for (const station of stations) {
      await page.evaluate((index) => window.scrollTo(0, index * window.innerHeight), station.index)
      await page.waitForFunction((index) => {
        const progress = Number(document.querySelector('[data-testid="journey"]')?.getAttribute('data-scene-progress'))
        return Math.abs(progress - index / 5) < 0.002
      }, station.index, { timeout: 45000 })
      await page.waitForTimeout(1800)
      const before = await canvas.screenshot()
      await page.waitForTimeout(1100)
      const after = await canvas.screenshot()
      const changed = !before.equals(after)
      const result = {
        viewport: `${viewport.width}x${viewport.height}`,
        station: station.name,
        expectedMotion: station.moving,
        imageChanged: changed,
        passed: changed === station.moving,
        beforeSha256: createHash('sha256').update(before).digest('hex'),
        afterSha256: createHash('sha256').update(after).digest('hex'),
        renderer,
      }
      results.push(result)
      console.log(result.viewport, result.station, result.passed ? 'passed' : 'FAILED')
    }
    if (pageErrors.length) throw new Error(`Page errors: ${pageErrors.join('; ')}`)
    await page.close()
  }
  await mkdir(path.dirname(outFile), { recursive: true })
  await writeFile(outFile, JSON.stringify(results, null, 2) + '\n')
  if (results.some((result) => !result.passed)) process.exitCode = 1
} finally {
  await browser.close()
}
