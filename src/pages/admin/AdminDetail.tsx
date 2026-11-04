import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { STATUS_LABEL, STATUS_TRANSITIONS, type InquiryStatus } from '../../../shared/status.ts'
import { formatTaipei } from '../../../shared/time.ts'
import { requestJson } from '../../lib/api.ts'
import styles from './Admin.module.css'
import { readAdminKey, useNoIndex } from './adminSession.ts'

type Inquiry = {
  id: number
  ticket: string
  company: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: InquiryStatus
  source: string
  createdAt: string
}

const actionLabel: Record<InquiryStatus, string> = {
  new: '標為新進',
  read: '標為已讀',
  archived: '封存',
}

export function AdminDetail() {
  useNoIndex()
  const { id = '' } = useParams()
  const adminKey = readAdminKey()
  const [item, setItem] = useState<Inquiry | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!adminKey) return
    let alive = true
    void requestJson(`/api/inquiries/${id}`, { headers: { authorization: `Bearer ${adminKey}` } }).then((result) => {
      if (!alive) return
      if (!result.ok) {
        setError(result.status === 404 ? '找不到這筆詢問' : result.message)
        setItem(null)
        return
      }
      setError('')
      setItem(result.body as Inquiry)
    })
    return () => {
      alive = false
    }
  }, [adminKey, id])

  const changeStatus = async (status: InquiryStatus) => {
    setPending(true)
    const result = await requestJson(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setError('')
    setItem(result.body as Inquiry)
  }

  if (!adminKey) {
    return (
      <div className={styles.page}>
        <h1>詢問內容</h1>
        <p className={styles.lead}>
          請先到<Link to="/admin">列表</Link>輸入管理金鑰。
        </p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <p className={`${styles.kicker} num`}>ADMIN</p>
      <h1>{item?.ticket ?? '詢問內容'}</h1>
      <p>
        <Link to="/admin">回到列表</Link>
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
      {item ? (
        <article className={`${styles.panel} ${styles.detail}`}>
          <dl>
            <dt>目前狀態</dt>
            <dd>{STATUS_LABEL[item.status]}</dd>
            <dt>時間</dt>
            <dd>
              <time dateTime={item.createdAt} title={item.createdAt}>
                {formatTaipei(item.createdAt)}
              </time>
            </dd>
            <dt>公司</dt>
            <dd>
              {item.company}
              {item.source === 'seed' ? <span className={styles.badge}>示意資料</span> : null}
            </dd>
            <dt>聯絡人</dt>
            <dd>{item.name}</dd>
            <dt>Email</dt>
            <dd>{item.email}</dd>
            <dt>電話</dt>
            <dd className="num">{item.phone}</dd>
            <dt>主旨</dt>
            <dd>{item.subject}</dd>
            <dt>內容</dt>
            <dd className={styles.message}>{item.message}</dd>
          </dl>
          <div className={styles.actions}>
            {STATUS_TRANSITIONS[item.status].map((status) => (
              <button key={status} type="button" disabled={pending} onClick={() => void changeStatus(status)}>
                {actionLabel[status]}
              </button>
            ))}
          </div>
        </article>
      ) : null}
    </div>
  )
}
