import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PartDrawing } from '../components/PartDrawing.tsx'
import { categoryFilters, categoryLabel, products, type ProductCategory } from '../data/products.ts'
import styles from './Products.module.css'

type FilterId = 'all' | ProductCategory

export function ProductsPage() {
  const [filter, setFilter] = useState<FilterId>('all')
  const { hash } = useLocation()
  const visible = products.filter((item) => filter === 'all' || item.category === filter)

  useEffect(() => {
    if (!hash) return
    const node = document.getElementById(hash.slice(1))
    node?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={`${styles.kicker} num`}>PRODUCTS</p>
        <h1>圖面上的形狀，做成可以裝配的零件。</h1>
        <p>八個示意品項。公差、交期與表面處理都是示範數字，不是報價，也不是檢測報告。</p>
      </header>
      <div className={styles.filters} role="group" aria-label="分類篩選">
        {categoryFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.chip}
            data-on={filter === item.id}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ul className={styles.grid}>
        {visible.map((item) => (
          <li key={item.id} id={item.id} className={styles.card}>
            <PartDrawing id={item.id} title={item.name} className={styles.drawing} />
            <div className={styles.body}>
              <p className={`${styles.cat} num`}>{categoryLabel[item.category]}</p>
              <h2>{item.name}</h2>
              <p className={styles.summary}>{item.summary}</p>
              <dl className={styles.specs}>
                <dt>材質</dt>
                <dd>{item.material}</dd>
                <dt>公差</dt>
                <dd>{item.tolerance}</dd>
                <dt>表面</dt>
                <dd>{item.finish}</dd>
                <dt>交期</dt>
                <dd>{item.leadTime}</dd>
              </dl>
              <p className={styles.desc}>{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
