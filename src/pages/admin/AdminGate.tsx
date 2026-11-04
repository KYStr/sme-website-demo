import { useCallback, useState, type FormEvent } from 'react'
import { requestJson } from '../../lib/api.ts'
import { AdminList } from './AdminList.tsx'
import styles from './Admin.module.css'
import { clearAdminKey, readAdminKey, useNoIndex, writeAdminKey } from './adminSession.ts'

export function AdminGate() {
  useNoIndex()
  const [key, setKey] = useState(readAdminKey)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await requestJson('/api/inquiries?page=1', {
      headers: { authorization: `Bearer ${draft}` },
    })
    if (!result.ok && result.status === 401) {
      setError('管理金鑰不正確')
      return
    }
    if (!result.ok && result.status === 503) {
      setError(result.message)
      return
    }
    if (!result.ok) {
      setError('連不上詢價服務')
      return
    }
    writeAdminKey(draft)
    setError('')
    setKey(draft)
  }

  const rejectKey = useCallback((message: string) => {
    clearAdminKey()
    setKey('')
    setError(message)
  }, [])

  if (key) {
    return <AdminList adminKey={key} onReject={rejectKey} />
  }

  return (
    <div className={styles.page}>
      <p className={`${styles.kicker} num`}>ADMIN</p>
      <h1>詢問列表</h1>
      <p className={styles.lead}>這道金鑰只保護這份示範。沒有設定金鑰時，列表不會開放。</p>
      <form className={`${styles.panel} ${styles.gate}`} onSubmit={onSubmit}>
        <label>
          管理金鑰
          <input type="password" autoComplete="off" value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit">進入列表</button>
      </form>
    </div>
  )
}
