import { lazy, Suspense, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { JourneyOverlay, StationStack } from '../components/JourneyOverlay.tsx'
import { syncJourneyOverlay } from '../components/syncJourneyOverlay.ts'
import { SceneBoundary } from '../components/SceneBoundary.tsx'
import { StaticFactory } from '../components/StaticFactory.tsx'
import { company, reasons, services } from '../data/company.ts'
import { usePrefersReducedMotion, useScrollProgress, useWebGLSupport } from '../hooks/useScrollProgress.ts'
import { useStationScroll } from '../hooks/useStationScroll.ts'
import styles from './Home.module.css'

const JourneyCanvas = lazy(() => import('../scene/JourneyCanvas.tsx'))

export function HomePage() {
  const journeyRef = useRef<HTMLElement>(null)
  const progressRef = useRef(0)
  const wakeSceneRef = useRef<(() => void) | null>(null)
  const depthRef = useRef<HTMLParagraphElement>(null)
  const reduced = usePrefersReducedMotion()
  const webgl = useWebGLSupport()
  const degrade = reduced || !webgl
  const onProgress = useCallback((progress: number) => {
    progressRef.current = progress
    wakeSceneRef.current?.()
    syncJourneyOverlay(journeyRef.current, progress)
    if (depthRef.current) depthRef.current.textContent = `DEPTH ${(progress * 34).toFixed(1)} m`
  }, [])
  useScrollProgress(journeyRef, onProgress, !degrade)
  useStationScroll(journeyRef, !degrade, 6)

  const jump = (index: number) => {
    const node = journeyRef.current
    if (!node) return
    const top = node.getBoundingClientRect().top + window.scrollY + index * window.innerHeight
    window.scrollTo({ top, behavior: 'instant' })
  }

  return (
    <div>
      {degrade ? (
        <div className={styles.fallbackPage}>
          <StaticFactory />
          <StationStack />
        </div>
      ) : (
        <section ref={journeyRef} className={styles.journey} data-testid="journey">
          <div className={styles.sticky}>
            <Suspense fallback={<div className={styles.loading}>廠房準備中</div>}>
              <SceneBoundary fallback={<StaticFactory />}>
                <JourneyCanvas progressRef={progressRef} wakeSceneRef={wakeSceneRef} />
              </SceneBoundary>
            </Suspense>
            <p ref={depthRef} className={`${styles.depth} num`} aria-hidden="true">
              DEPTH 0.0 m
            </p>
            <JourneyOverlay onJump={jump} />
          </div>
        </section>
      )}
      <div id="after-journey" className={styles.rest}>
        <section className={styles.section} aria-labelledby="services-title">
          <p className={`${styles.kicker} num`}>01 — SERVICES</p>
          <h2 id="services-title">三項核心能力</h2>
          <p className={styles.lede}>{company.positioning}</p>
          <div className={styles.grid3}>
            {services.map((item) => (
              <article key={item.title} className={styles.panel}>
                <span className={`${styles.index} num`}>{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section} aria-labelledby="featured-title">
          <p className={`${styles.kicker} num`}>02 — PARTS</p>
          <h2 id="featured-title">常做的示意品項</h2>
          <div className={styles.featureRow}>
            {[
              ['精密軸心', '/products#shaft', '外徑 ±0.01 mm'],
              ['法蘭盤', '/products#flange', '止口 ±0.02 mm'],
              ['齒輪', '/products#gear', '小模數直齒'],
              ['治具板', '/products#plate', '孔位 ±0.02 mm'],
            ].map(([name, href, spec]) => (
              <Link key={href} to={href} className={styles.feature}>
                <span className="num">{spec}</span>
                <strong>{name}</strong>
              </Link>
            ))}
          </div>
        </section>
        <section className={styles.section} aria-labelledby="why-title">
          <p className={`${styles.kicker} num`}>03 — QC</p>
          <h2 id="why-title">為什麼把圖面送來這裡</h2>
          <div className={styles.grid3}>
            {reasons.map((item) => (
              <article key={item.title} className={styles.panel}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.ctaBand} aria-labelledby="cta-title">
          <p className={`${styles.kicker} num`}>04 — INQUIRY</p>
          <h2 id="cta-title">把圖面送來，我們先看做不做得到。</h2>
          <p>描述材質、數量與交期。示範表單不會對外寄出。</p>
          <Link className={styles.cta} to="/contact">
            立即詢價
          </Link>
        </section>
      </div>
    </div>
  )
}
