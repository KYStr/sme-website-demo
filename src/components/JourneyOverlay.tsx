import { Link } from 'react-router-dom'
import type { JourneyStation } from '../data/journey.ts'
import { journeyStations } from '../data/journey.ts'
import styles from './JourneyOverlay.module.css'

type OverlayProps = {
  onJump: (index: number) => void
}

export function JourneyOverlay({ onJump }: OverlayProps) {
  return (
    <div className={styles.overlay} data-testid="journey-overlay" data-active-station="0">
      <div className={styles.scrim} />
      <div className={styles.stack}>
        {journeyStations.map((station, index) => {
          return (
            <article
              key={station.id}
              data-testid={`journey-card-${station.id}`}
              data-journey-index={index}
              className={styles.card}
              style={{
                opacity: index === 0 ? 1 : 0,
                visibility: index === 0 ? 'visible' : 'hidden',
              }}
              aria-hidden={index !== 0}
              inert={index !== 0}
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
            data-journey-tick={index}
            data-on={index === 0}
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
        <section key={station.id} className={styles.staticCard} data-testid="static-journey-card">
          <StationBody station={station} />
        </section>
      ))}
    </div>
  )
}
