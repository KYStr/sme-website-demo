import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Logo } from './Logo.tsx'
import styles from './Header.module.css'

const links = [
  { to: '/', label: '首頁' },
  { to: '/products', label: '產品與服務' },
  { to: '/about', label: '關於我們' },
  { to: '/contact', label: '聯絡詢價' },
]

export function Header() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const solid = pathname !== '/'

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className={styles.header} data-solid={solid} data-open={open}>
      <NavLink to="/" className={styles.brand} aria-label="精睿精密工業，回到首頁" onClick={() => setOpen(false)}>
        <Logo />
      </NavLink>
      <nav id="site-nav" className={styles.nav} aria-label="主要" data-open={open}>
        <ul className={styles.list}>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <NavLink to="/contact" className={styles.cta} onClick={() => setOpen(false)}>
        立即詢價
      </NavLink>
      <button
        type="button"
        className={styles.burger}
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.sr}>{open ? '關閉選單' : '開啟選單'}</span>
        <span className={styles.bars} data-open={open} aria-hidden="true" />
      </button>
    </header>
  )
}
