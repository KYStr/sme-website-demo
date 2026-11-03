import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const outDir = path.resolve('docs/screenshots')

const shot = process.env.SHOT ?? 'all'
const stationFilter = process.env.STATION === undefined ? null : process.env.STATION.split(',').map(Number)
const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '360x800', width: 360, height: 800 },
].filter((item) => {
  if (shot === 'desktop' || shot === 'check') return item.name === '1440x900'
  if (shot === 'mobile') return item.name === '360x800'
  return true
})

const stations = ['s0-exterior', 's1-gate', 's2-cnc', 's3-rack', 's4-cmm', 's5-ship']
const pages = [
  { slug: 'products', route: '/products' },
  { slug: 'about', route: '/about' },
  { slug: 'contact', route: '/contact' },
]

await mkdir(outDir, { recursive: true })

const hardware = process.env.HARDWARE === '1'
const chromeHeadless = process.env.CHROME_HEADLESS === '1'
const browser = await chromium.launch({
  ...(hardware || chromeHeadless ? { channel: 'chrome', headless: !hardware } : {}),
  args: hardware || chromeHeadless ? ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--hide-scrollbars'] : ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
})

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } })
  page.on('pageerror', (error) => console.error('pageerror', error.message))
  await page.goto(baseURL + '/', { waitUntil: 'commit', timeout: 60000 })
  await page.waitForSelector('header', { timeout: 20000 })
  await page.evaluate(() => document.fonts.ready)
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 60000 })
  await page.waitForTimeout(1600)
  console.log(viewport.name, await page.evaluate(() => {
    const node = document.querySelector('canvas')
    return { canvas: node ? `${node.width}x${node.height}` : 'none', title: document.querySelector('h2')?.textContent ?? '' }
  }))

  for (let index = 0; index < stations.length; index += 1) {
    if (stationFilter !== null && !stationFilter.includes(index)) continue
    await page.evaluate((station) => {
      const journey = document.querySelector('[data-testid="journey"]')
      const top = journey ? journey.getBoundingClientRect().top + window.scrollY : 0
      window.scrollTo(0, top + station * window.innerHeight)
    }, index)
    await page.waitForFunction((station) => {
      const cards = document.querySelectorAll('[data-testid^="journey-card-"]')
      return cards[station]?.getAttribute('aria-hidden') === 'false'
    }, index, { timeout: 30000 })
    await page.waitForFunction((station) => {
      const journey = document.querySelector('[data-testid="journey"]')
      const visual = Number(journey?.getAttribute('data-scene-progress'))
      return journey?.hasAttribute('data-scene-progress') && Math.abs(visual - station / 5) < 0.004
    }, index, { timeout: 30000 })
    await page.waitForTimeout(600)
    const file = path.join(outDir, `home-${stations[index]}-${viewport.name}.png`)
    await page.screenshot({ path: file, timeout: 120000, animations: 'disabled' })
    console.log(file)
  }

  if (shot === 'home' || shot === 'check' || shot === 'mobile') {
    await page.close()
    continue
  }
  for (const item of pages) {
    await page.goto(baseURL + item.route, { waitUntil: 'commit', timeout: 60000 })
    await page.waitForSelector('h1', { timeout: 20000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)
    const file = path.join(outDir, `${item.slug}-${viewport.name}.png`)
    await page.screenshot({ path: file, timeout: 120000, animations: 'disabled' })
    console.log(file)
  }

  await page.close()
}

await browser.close()
