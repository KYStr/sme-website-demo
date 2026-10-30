import { Link } from 'react-router-dom'
import { company } from '../data/company.ts'
import { Logo } from './Logo.tsx'
import styles from './Footer.module.css'

const links = [
  { to: '/', label: '首頁' },
  { to: '/products', label: '產品與服務' },
  { to: '/about', label: '關於我們' },
  { to: '/contact', label: '聯絡詢價' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <Logo />
          <p className={styles.tag}>{company.tagline}</p>
          <p className={styles.en}>{company.nameEn}</p>
        </div>
        <div>
          <h2 className={styles.label}>導覽</h2>
          <nav aria-label="頁尾" className={styles.links}>
            {links.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className={styles.label}>聯絡（示意）</h2>
          <p>{company.address}</p>
          <p className="num">{company.phone}</p>
          <p>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </p>
          <p>{company.hours}</p>
        </div>
      </div>
      <p className={styles.disclaimer}>{company.disclaimer}</p>
    </footer>
  )
}
