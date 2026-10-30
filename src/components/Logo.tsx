import styles from './Logo.module.css'

type LogoProps = {
  compact?: boolean
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <span className={styles.logo}>
      <svg className={styles.mark} viewBox="0 0 40 40" aria-hidden="true">
        <rect x="1.5" y="1.5" width="37" height="37" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1.5 9h3.2M1.5 15h2M1.5 21h3.2M1.5 27h2M1.5 33h3.2" stroke="currentColor" strokeWidth="1" />
        <path d="M12 9h16.5v4.1H17.2v4.1h8.4V21.4H17.2V31H12z" fill="currentColor" />
      </svg>
      <span className={styles.word}>
        <strong>精睿精密</strong>
        {compact ? null : <small className="num">FINEFORM</small>}
      </span>
    </span>
  )
}
