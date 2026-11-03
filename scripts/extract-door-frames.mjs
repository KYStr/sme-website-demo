import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

const dir = path.resolve('docs/verification-media')
const videoFile = process.env.VIDEO_FILE ?? 'door-entry-960x600.webm'
const marks = (process.env.MARKS ?? '11,12,13,14,15,16').split(',').map(Number)
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(pathToFileURL(path.join(dir, videoFile)).href)
await page.waitForSelector('video')
for (const second of marks) {
  await page.evaluate(async (time) => {
    const video = document.querySelector('video')
    await new Promise((resolve) => {
      video.addEventListener('seeked', resolve, { once: true })
      video.currentTime = time
    })
  }, second)
  await page.locator('video').screenshot({ path: path.join(dir, `${path.parse(videoFile).name}-${String(second).replace('.', '-')}s.png`) })
}
await browser.close()
