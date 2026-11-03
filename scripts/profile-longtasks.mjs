import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=d3d11'] })
const results = []

for (let attempt = 1; attempt <= 5; attempt += 1) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'commit' })
  await page.waitForSelector('[data-testid="journey"][data-scene-progress]', { timeout: 60000 })
  await page.waitForTimeout(500)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForFunction(() => Number(document.querySelector('[data-testid="journey"]')?.getAttribute('data-scene-progress')) < 0.004)

  const cdp = await context.newCDPSession(page)
  await cdp.send('Profiler.enable')
  await cdp.send('Profiler.start')
  const events = []
  cdp.on('Tracing.dataCollected', ({ value }) => events.push(...value))
  const completed = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve))
  await cdp.send('Tracing.start', {
    categories: 'devtools.timeline,disabled-by-default-devtools.timeline,v8,disabled-by-default-v8.gc,blink.user_timing',
    options: 'record-as-much-as-possible',
  })

  const result = await page.evaluate(async () => {
    const tasks = []
    const start = performance.now()
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) tasks.push({ ms: Math.round(entry.startTime - start), durationMs: Math.round(entry.duration), name: entry.name })
    })
    observer.observe({ entryTypes: ['longtask'] })
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 650, cancelable: true }))
    const frames = []
    let last = start
    await new Promise((resolve) => {
      const sample = () => {
        const now = performance.now()
        frames.push({ ms: Math.round(now - start), frameMs: Math.round(now - last) })
        last = now
        if (now - start < 5000) requestAnimationFrame(sample)
        else resolve()
      }
      requestAnimationFrame(sample)
    })
    observer.disconnect()
    return { tasks, maxFrameMs: Math.max(...frames.map((item) => item.frameMs)), frames }
  })
  await cdp.send('Tracing.end')
  await completed
  const { profile } = await cdp.send('Profiler.stop')
  results.push({ attempt, tasks: result.tasks, maxFrameMs: result.maxFrameMs, eventCount: events.length })
  console.log(results.at(-1))
  if (result.tasks.length || result.maxFrameMs > 50) {
    await writeFile(path.join(process.env.TEMP, 'sme-factory-cdp-trace.json'), JSON.stringify({ traceEvents: events }))
    await writeFile(path.join(process.env.TEMP, 'sme-factory-cdp-frames.json'), JSON.stringify(result))
    await writeFile(path.join(process.env.TEMP, 'sme-factory-cdp-profile.json'), JSON.stringify(profile))
    await context.close()
    break
  }
  await context.close()
}

await browser.close()
console.log('trace:', path.join(process.env.TEMP, 'sme-factory-cdp-trace.json'))
