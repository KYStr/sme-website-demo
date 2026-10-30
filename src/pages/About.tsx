import { useEffect, useRef } from 'react'
import { company, stats } from '../data/company.ts'
import { equipment } from '../data/equipment.ts'
import { history, qualitySteps } from '../data/history.ts'
import { usePrefersReducedMotion } from '../hooks/useScrollProgress.ts'
import styles from './About.module.css'

export function AboutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={`${styles.kicker} num`}>ABOUT</p>
        <h1>一家把打樣當本業的加工廠。</h1>
        <p>
          {company.name}是虛構的台中精密加工廠。我們用這個示範站說明少量多樣怎麼被講清楚：能力邊界、設備範圍，以及出貨前會看哪些尺寸。
        </p>
      </header>
      <ul className={styles.stats}>
        {stats.map((item) => (
          <li key={item.label}>
            <strong className="num">
              {item.value}
              <small>{item.unit}</small>
            </strong>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      <section aria-labelledby="history-title">
        <p className={`${styles.kicker} num`}>TIMELINE</p>
        <h2 id="history-title">沿革（示意）</h2>
        <Timeline />
      </section>
      <section aria-labelledby="equip-title">
        <p className={`${styles.kicker} num`}>EQUIPMENT</p>
        <h2 id="equip-title">設備與能力</h2>
        <p className={styles.note}>名稱用通用型號，例如「五軸加工中心 A 型」。不對應任何真實機台廠牌。</p>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>設備</th>
                <th>能力（示意）</th>
                <th>備註</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((row) => (
                <tr key={row.name}>
                  <td data-label="設備">{row.name}</td>
                  <td data-label="能力（示意）">{row.spec}</td>
                  <td data-label="備註">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="quality-title">
        <p className={`${styles.kicker} num`}>QUALITY</p>
        <h2 id="quality-title">從收圖到出貨</h2>
        <ol className={styles.flow}>
          {qualitySteps.map((step) => (
            <li key={step.index}>
              <span className="num">{step.index}</span>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function Timeline() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const items = [...list.querySelectorAll('li')]
    if (reduced) {
      items.forEach((item) => item.classList.add(styles.on))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add(styles.on)
        })
      },
      { threshold: 0.4 },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [reduced])

  return (
    <ol ref={listRef} className={styles.timeline} data-animate={reduced ? 'off' : 'on'}>
      {history.map((event) => (
        <li key={event.year} className={styles.event}>
          <span className={`${styles.year} num`}>{event.year}</span>
          <div>
            <h3>{event.title}</h3>
            <p>{event.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
