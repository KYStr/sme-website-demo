import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { STATUS_LABEL, type InquiryStatus } from '../../../shared/status.ts'
import { formatTaipei } from '../../../shared/time.ts'
import { requestJson } from '../../lib/api.ts'
import styles from './Admin.module.css'

const filters = [
  { value: '', label: '全部' },
  { value: 'new', label: '新進' },
  { value: 'read', label: '已讀' },
  { value: 'archived', label: '已封存' },
] as const

type ListItem = {
  id: number
  ticket: string
  company: string
  name: string
  emailMasked: string
  phoneMasked: string
  subject: string
  status: InquiryStatus
  source: string
  createdAt: string
}

type ListBody = { page: number; pageSize: number; total: number; items: ListItem[] }

export function AdminList({ adminKey, onReject }: { adminKey: string; onReject: (message: string) => void }) {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''
  const q = params.get('q') ?? ''
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const [draft, setDraft] = useState(q)
  const [seenQuery, setSeenQuery] = useState(q)
  const [data, setData] = useState<ListBody | null>(null)
  const [error, setError] = useState('')
  if (seenQuery !== q) {
    setSeenQuery(q)
    setDraft(q)
  }

  useEffect(() => {
    let alive = true
    const query = new URLSearchParams({ page: String(page) })
    if (status) query.set('status', status)
    if (q) query.set('q', q)
    void requestJson(`/api/inquiries?${query}`, { headers: { authorization: `Bearer ${adminKey}` } }).then((result) => {
      if (!alive) return
      if (!result.ok && (result.status === 401 || result.status === 429)) {
        onReject(result.message)
        return
      }
      if (!result.ok) {
        setError(result.status === 503 ? result.message : '連不上詢價服務')
        setData(null)
        return
      }
      setError('')
      setData(result.body as ListBody)
    })
    return () => {
      alive = false
    }
  }, [adminKey, onReject, page, q, status])

  const setQuery = (next: { status?: string; q?: string; page?: number }) => {
    const updated = new URLSearchParams(params)
    const statusValue = next.status ?? status
    const qValue = next.q ?? q
    const pageValue = next.page ?? 1
    if (statusValue) updated.set('status', statusValue)
    else updated.delete('status')
    if (qValue) updated.set('q', qValue)
    else updated.delete('q')
    if (pageValue > 1) updated.set('page', String(pageValue))
    else updated.delete('page')
    setParams(updated)
  }

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setQuery({ q: draft.trim(), page: 1 })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className={styles.page}>
      <p className={`${styles.kicker} num`}>ADMIN</p>
      <h1>詢問列表</h1>
      <p className={styles.lead}>聯絡資訊在列表裡是遮罩過的。這是示範用的金鑰把關，不是登入系統。</p>
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="group" aria-label="狀態">
          {filters.map((filter) => (
            <button
              key={filter.value || 'all'}
              type="button"
              aria-current={status === filter.value ? 'page' : undefined}
              onClick={() => setQuery({ status: filter.value, page: 1 })}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <form className={styles.filters} onSubmit={onSearch}>
          <label>
            關鍵字
            <input value={draft} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <button type="submit">搜尋</button>
        </form>
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <ul className={styles.list}>
        {data?.items.map((item) => (
          <li key={item.id} className={styles.card}>
            <Link className={`${styles.ticket} num`} to={`/admin/${item.id}`}>
              {item.ticket}
            </Link>
            <div>
              <strong>
                {item.company}
                {item.source === 'seed' ? <span className={styles.badge}>示意資料</span> : null}
              </strong>
              <div className={styles.meta}>
                <span>{item.name}</span>
                <span>{item.emailMasked}</span>
                <span className="num">{item.phoneMasked}</span>
                <span>{item.subject}</span>
              </div>
            </div>
            <div>
              <div>{STATUS_LABEL[item.status]}</div>
              <time dateTime={item.createdAt} title={item.createdAt}>
                {formatTaipei(item.createdAt)}
              </time>
            </div>
          </li>
        ))}
      </ul>
      {data && data.items.length === 0 ? <p className={styles.muted}>目前沒有符合的詢問。</p> : null}
      {data ? (
        <div className={styles.pager}>
          <button type="button" disabled={page <= 1} onClick={() => setQuery({ page: page - 1 })}>
            上一頁
          </button>
          <span>
            第 {page} / {totalPages} 頁，共 {data.total} 筆
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => setQuery({ page: page + 1 })}>
            下一頁
          </button>
        </div>
      ) : null}
    </div>
  )
}
