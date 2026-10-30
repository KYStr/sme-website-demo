import { lazy, Suspense, useEffect, useRef } from 'react'
import { SceneBoundary } from '../components/SceneBoundary.tsx'
import { StaticFactory } from '../components/StaticFactory.tsx'
import { usePrefersReducedMotion, useScrollProgress, useWebGLSupport } from '../hooks/useScrollProgress.ts'
import styles from './Home.module.css'

const JourneyCanvas = lazy(() => import('../scene/JourneyCanvas.tsx'))

export function HomePage() {
  const journeyRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(journeyRef)
  const progressRef = useRef(0)
  progressRef.current = progress
  const reduced = usePrefersReducedMotion()
  const webgl = useWebGLSupport()
  const degrade = reduced || !webgl

  useEffect(() => {
    document.documentElement.classList.toggle('snap-home', !degrade)
    return () => document.documentElement.classList.remove('snap-home')
  }, [degrade])

  if (degrade) {
    return (
      <div className={styles.fallbackPage}>
        <StaticFactory />
      </div>
    )
  }

  return (
    <section ref={journeyRef} className={styles.journey} data-testid="journey">
      <div className={styles.sticky}>
        <Suspense fallback={<div className={styles.loading}>廠房準備中</div>}>
          <SceneBoundary fallback={<StaticFactory />}>
            <JourneyCanvas progressRef={progressRef} />
          </SceneBoundary>
        </Suspense>
        <p className={`${styles.depth} num`} aria-hidden="true">
          DEPTH {(progress * 34).toFixed(1)} m
        </p>
      </div>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={styles.snap} style={{ top: `${index * 100}vh` }} />
      ))}
    </section>
  )
}
