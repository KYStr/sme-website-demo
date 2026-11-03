import { mkdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const outDir = path.resolve('docs/verification-media')
await mkdir(outDir, { recursive: true })
const viewport = { width: Number(process.env.VIEW_WIDTH ?? 960), height: Number(process.env.VIEW_HEIGHT ?? 600) }
const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const pageQuery = process.env.PAGE_QUERY ?? ''
const traceLabel = process.env.TRACE_LABEL ?? ''

const software = process.env.SOFTWARE !== '0'
const headful = process.env.HEADFUL === '1'
const chromeHeadless = process.env.CHROME_HEADLESS === '1'
const browser = await chromium.launch({
  ...(headful || chromeHeadless ? { channel: 'chrome', headless: !headful } : {}),
  args: software ? ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'] : ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11'],
})
const recordVideo = process.env.RECORD_VIDEO === '1'
const context = await browser.newContext({
  viewport,
  ...(recordVideo ? { recordVideo: { dir: outDir, size: viewport } } : {}),
})
const page = await context.newPage()
page.on('pageerror', (error) => console.error('pageerror', error.message))
await page.goto(baseURL + '/' + pageQuery, { waitUntil: 'commit', timeout: 60000 })
await page.waitForSelector('[data-testid="journey"][data-scroll-ready="true"][data-scene-progress]', { timeout: 60000 })
await page.locator('canvas').waitFor({ state: 'visible', timeout: 60000 })
await page.waitForTimeout(500)
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForFunction(() => {
  const journey = document.querySelector('[data-testid="journey"]')
  return window.scrollY === 0 && Number(journey?.getAttribute('data-scene-progress')) < 0.004
}, undefined, { timeout: 30000 })
const renderer = await page.evaluate(() => {
  const gl = document.querySelector('canvas')?.getContext('webgl2')
  if (!gl) return 'unavailable'
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
})

const { samples, longTasks } = await page.evaluate(async () => {
  const journey = document.querySelector('[data-testid="journey"]')
  const trace = []
  const longTasks = []
  const observer = new PerformanceObserver((list) => {
    for (const item of list.getEntries()) longTasks.push({ ms: Math.round(item.startTime - start), durationMs: Math.round(item.duration) })
  })
  const start = performance.now()
  observer.observe({ entryTypes: ['longtask'] })
  let lastFrame = start
  window.dispatchEvent(new WheelEvent('wheel', { deltaY: 650, cancelable: true }))
  await new Promise((resolve) => {
    const fallback = setTimeout(resolve, 5500)
    const sample = () => {
      const now = performance.now()
      trace.push({
        ms: Math.round(now - start),
        frameMs: Math.round(now - lastFrame),
        sceneProgress: Number(journey?.getAttribute('data-scene-progress')),
        doorOpen: Number(journey?.getAttribute('data-door-open')),
        drawCalls: journey?.hasAttribute('data-draw-calls') ? Number(journey.getAttribute('data-draw-calls')) : null,
        renderCount: journey?.hasAttribute('data-render-count') ? Number(journey.getAttribute('data-render-count')) : null,
        scrollY: Math.round(window.scrollY),
      })
      lastFrame = now
      if (now - start < 5000) requestAnimationFrame(sample)
      else {
        clearTimeout(fallback)
        resolve()
      }
    }
    requestAnimationFrame(sample)
  })
  observer.disconnect()
  return { samples: trace, longTasks }
})

await page.waitForTimeout(300)
const video = recordVideo ? page.video() : null
await context.close()
if (video) await rename(await video.path(), path.join(outDir, `door-entry-${viewport.width}x${viewport.height}.webm`))
await browser.close()
await writeFile(path.join(outDir, `door-entry-trace-${headful ? 'chrome' : chromeHeadless ? 'chrome-headless' : software ? 'software' : 'default'}-${recordVideo ? 'video' : 'plain'}-${viewport.width}x${viewport.height}${traceLabel ? '-' + traceLabel : ''}.json`), JSON.stringify({ renderer, samples, longTasks }, null, 2) + '\n')

const frames = samples.map((item) => item.frameMs).filter((value) => value > 0).sort((a, b) => a - b)
console.log({
  samples: samples.length,
  first: samples[0],
  last: samples.at(-1),
  medianFrameMs: frames[Math.floor(frames.length / 2)],
  p95FrameMs: frames[Math.floor(frames.length * 0.95)],
  medianDrawCalls: samples.some((item) => item.drawCalls !== null)
    ? samples.map((item) => item.drawCalls).filter((value) => value !== null).sort((a, b) => a - b)[Math.floor(samples.length / 2)]
    : null,
  renderCount: samples.at(-1)?.renderCount ?? null,
  longTasks,
  renderer,
  video: recordVideo ? path.join(outDir, `door-entry-${viewport.width}x${viewport.height}.webm`) : 'not recorded',
})
