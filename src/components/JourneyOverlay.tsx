import { Link } from 'react-router-dom'
import type { JourneyStation } from '../data/journey.ts'
import { journeyStations } from '../data/journey.ts'
import { smoothstep } from '../lib/smoothstep.ts'
import styles from './JourneyOverlay.module.css'

type OverlayProps = {
  progress: number
  onJump: (index: number) => void
}

export function JourneyOverlay({ progress, onJump }: OverlayProps) {
  const active = Math.round(progress * (journeyStations.length - 1))
  return (
    <div className={styles.overlay}>
      <div className={styles.scrim} />
      <div className={styles.stack}>
        {journeyStations.map((station, index) => {
          const center = index / (journeyStations.length - 1)
          const opacity = 1 - smoothstep(0.06, 0.15, Math.abs(progress - center))
          const shift = (progress - center) * 36
          return (
            <article
              key={station.id}
              className={styles.card}
              style={{
                opacity,
                transform: `translate3d(0, ${shift}px, 0)`,
                visibility: opacity < 0.04 ? 'hidden' : 'visible',
              }}
              aria-hidden={opacity < 0.45}
            >
              <StationBody station={station} />
            </article>
          )
        })}
      </div>
      <a className={styles.skip} href="#after-journey">
        跳過旅程
      </a>
      <div className={styles.ruler} role="group" aria-label="旅程站點">
        {journeyStations.map((station, index) => (
          <button
            key={station.id}
            type="button"
            className={styles.tick}
            data-on={index === active}
            aria-label={`前往${station.kicker}：${station.title}`}
            onClick={() => onJump(index)}
          >
            <span className="num">{station.index}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function StationBody({ station }: { station: JourneyStation }) {
  return (
    <div className={styles.copy}>
      <p className={`${styles.kicker} num`}>{station.kicker}</p>
      <h2 className={styles.title}>{station.title}</h2>
      {station.body ? <p className={styles.body}>{station.body}</p> : null}
      {station.note ? <p className={styles.note}>{station.note}</p> : null}
      {station.stats ? (
        <ul className={styles.stats}>
          {station.stats.map((item) => (
            <li key={item.label}>
              <strong className="num">{item.value}</strong>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {station.services ? (
        <ul className={styles.services}>
          {station.services.map((item, index) => (
            <li key={item.title}>
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {station.links ? (
        <ul className={styles.links}>
          {station.links.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
      ) : null}
      {station.reasons ? (
        <ul className={styles.reasons}>
          {station.reasons.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {station.cta ? (
        <Link className={styles.cta} to={station.cta.to}>
          {station.cta.label}
        </Link>
      ) : null}
    </div>
  )
}

export function StationStack() {
  return (
    <div className={styles.stackPage}>
      {journeyStations.map((station) => (
        <section key={station.id} className={styles.staticCard}>
          <StationBody station={station} />
        </section>
      ))}
    </div>
  )
}
