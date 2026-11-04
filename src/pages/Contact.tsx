import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FIELD_KEYS, FIELD_LIMITS, fieldErrorMessage, validateInquiry, type FieldKey } from '../../shared/inquiry.ts'
import { company } from '../data/company.ts'
import { checkHealth, isTicket, requestJson } from '../lib/api.ts'
import { buildMailto } from '../lib/mailto.ts'
import styles from './Contact.module.css'

type FormState = Record<FieldKey, string>

const initial: FormState = {
  company: '',
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

const fields: Array<{ key: FieldKey; label: string; type?: string; multiline?: boolean; placeholder?: string }> = [
  { key: 'company', label: '公司', placeholder: '例如：北嶺試作所（示意）' },
  { key: 'name', label: '聯絡人', placeholder: '怎麼稱呼' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' },
  { key: 'phone', label: '電話', type: 'tel', placeholder: '04-2000-0000' },
  { key: 'subject', label: '主旨', placeholder: '例如：軸心打樣估價（示意）' },
  { key: 'message', label: '詢問內容', multiline: true, placeholder: '材質、數量、公差與希望交期' },
]

type Phase = 'checking' | 'online' | 'submitting' | 'success' | 'offline' | 'rateLimited'

function fingerprint(values: FormState) {
  return FIELD_KEYS.map((key) => values[key]).join('\u0001')
}

function clientErrors(values: FormState) {
  const result = validateInquiry(values)
  if (result.ok) return {}
  const errors: Partial<Record<FieldKey, string>> = {}
  for (const key of FIELD_KEYS) {
    const code = result.fields[key]
    if (code) errors[key] = fieldErrorMessage(key, code)
  }
  return errors
}

function focusField(errors: Partial<Record<FieldKey, string>>) {
  const key = FIELD_KEYS.find((item) => errors[item])
  if (!key) return
  document.getElementById(`field-${key}`)?.focus()
}

export function ContactPage() {
  const [values, setValues] = useState<FormState>(initial)
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [phase, setPhase] = useState<Phase>('checking')
  const [ticket, setTicket] = useState('')
  const [rateMessage, setRateMessage] = useState('')
  const [conflict, setConflict] = useState('')
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID())
  const token = useRef('')
  const tokenAt = useRef(0)
  const snapshot = useRef<string | null>(null)
  const sending = useRef(false)
  const healthPromise = useRef<Promise<{ online: true; formToken: string } | { online: false }> | null>(null)

  const loadHealth = () => {
    const pending = checkHealth()
    healthPromise.current = pending
    return pending
  }

  useEffect(() => {
    let alive = true
    void loadHealth().then((result) => {
      if (!alive) return
      if (result.online) {
        token.current = result.formToken
        tokenAt.current = performance.now()
        setPhase('online')
      } else {
        setPhase('offline')
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const resetForm = () => {
    setValues(initial)
    setWebsite('')
    setErrors({})
    setTicket('')
    setRateMessage('')
    setConflict('')
    setSubmissionId(crypto.randomUUID())
    snapshot.current = null
    setPhase('checking')
    void loadHealth().then((result) => {
      if (result.online) {
        token.current = result.formToken
        tokenAt.current = performance.now()
        setPhase('online')
      } else {
        setPhase('offline')
      }
    })
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending.current) return
    const nextErrors = clientErrors(values)
    setErrors(nextErrors)
    setConflict('')
    if (Object.keys(nextErrors).length > 0) {
      focusField(nextErrors)
      return
    }

    sending.current = true
    setPhase('submitting')
    try {
      const health = await (healthPromise.current ?? loadHealth())
      if (!health.online) {
        setPhase('offline')
        return
      }
      token.current = token.current || health.formToken
      if (!tokenAt.current) tokenAt.current = performance.now()
      const elapsed = performance.now() - tokenAt.current
      if (elapsed < 2200) await new Promise((resolve) => setTimeout(resolve, 2200 - elapsed))

      snapshot.current = fingerprint(values)
      const result = await requestJson('/api/inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, submissionId, formToken: token.current, website }),
      })

      if (result.ok && result.status === 201 && isTicket((result.body as { ticket?: unknown }).ticket)) {
        setTicket((result.body as { ticket: string }).ticket)
        setPhase('success')
        return
      }
      if (!result.ok && result.status === 422 && result.fields) {
        const mapped: Partial<Record<FieldKey, string>> = {}
        for (const key of FIELD_KEYS) {
          const code = result.fields[key]
          if (code) mapped[key] = fieldErrorMessage(key, code)
        }
        setErrors(mapped)
        setPhase('online')
        focusField(mapped)
        return
      }
      if (!result.ok && result.code === 'form_expired') {
        const refreshed = await loadHealth()
        if (refreshed.online) {
          token.current = refreshed.formToken
          tokenAt.current = performance.now()
        }
        setConflict('表單已逾期，請再按一次送出')
        setPhase(refreshed.online ? 'online' : 'offline')
        return
      }
      if (!result.ok && result.status === 409) {
        setSubmissionId(crypto.randomUUID())
        snapshot.current = null
        setConflict('內容已變更，請再按一次送出')
        setPhase('online')
        return
      }
      if (!result.ok && result.status === 429) {
        setRateMessage(result.message)
        setPhase('rateLimited')
        return
      }
      setPhase('offline')
    } finally {
      sending.current = false
    }
  }

  const hero =
    phase === 'offline'
      ? '現在連不上詢價服務，這張表單不會假裝送出。'
      : phase === 'success'
        ? '這筆詢問已經收下。'
        : phase === 'checking'
          ? '正在確認詢價服務是否在線。'
          : '填好就送出，我們會給你一組詢價編號。'

  const mailto = buildMailto(company.email, values)

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={`${styles.kicker} num`}>INQUIRY</p>
        <h1>先把條件寫清楚。</h1>
        <p>{hero}</p>
      </header>
      <div className={styles.layout}>
        <aside className={styles.card}>
          <p className={`${styles.ticket} num`}>FF-REQ-示意</p>
          <h2>聯絡資料（示意）</h2>
          <dl>
            <dt>地址</dt>
            <dd>{company.address}</dd>
            <dt>電話</dt>
            <dd className="num">{company.phone}</dd>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </dd>
            <dt>時間</dt>
            <dd>{company.hours}</dd>
          </dl>
          <p className={styles.note}>{company.disclaimer}</p>
        </aside>
        <form className={styles.form} data-testid="contact-form" data-api={phase} onSubmit={onSubmit} noValidate>
          {fields.map((field) => {
            const error = errors[field.key]
            const inputId = `field-${field.key}`
            const errorId = `${inputId}-error`
            return (
              <label key={field.key} className={field.multiline ? styles.wide : undefined} htmlFor={inputId}>
                <span>
                  {field.label}
                  <abbr className={styles.req} title="必填">
                    *
                  </abbr>
                </span>
                {field.multiline ? (
                  <textarea
                    id={inputId}
                    name={field.key}
                    rows={6}
                    maxLength={FIELD_LIMITS[field.key]}
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    aria-required="true"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) => {
                      const next = { ...values, [field.key]: event.target.value }
                      setValues(next)
                      if (snapshot.current && fingerprint(next) !== snapshot.current) {
                        setSubmissionId(crypto.randomUUID())
                        snapshot.current = null
                      }
                    }}
                  />
                ) : (
                  <input
                    id={inputId}
                    name={field.key}
                    type={field.type ?? 'text'}
                    maxLength={FIELD_LIMITS[field.key]}
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    aria-required="true"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) => {
                      const next = { ...values, [field.key]: event.target.value }
                      setValues(next)
                      if (snapshot.current && fingerprint(next) !== snapshot.current) {
                        setSubmissionId(crypto.randomUUID())
                        snapshot.current = null
                      }
                    }}
                  />
                )}
                {error ? (
                  <small id={errorId} role="alert">
                    {error}
                  </small>
                ) : null}
              </label>
            )
          })}
          <div className={styles.honey} aria-hidden="true">
            <input
              tabIndex={-1}
              autoComplete="off"
              name="website"
              value={website}
              aria-hidden="true"
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>
          {phase === 'success' ? (
            <p className={styles.notice} data-testid="form-notice" role="status">
              已收到你的詢問，編號 {ticket}
            </p>
          ) : null}
          {phase === 'offline' ? (
            <p className={styles.offline} data-testid="form-offline" role="status">
              目前連不上詢價服務，表單沒有送出。你可以用電子郵件把內容寄給我們。{' '}
              <a href={mailto}>改用電子郵件</a>
            </p>
          ) : null}
          {phase === 'rateLimited' ? (
            <p className={styles.limited} data-testid="form-rate-limit" role="status">
              {rateMessage} <a href={mailto}>改用電子郵件</a>
            </p>
          ) : null}
          {conflict ? (
            <p className={styles.notice} role="status">
              {conflict}
            </p>
          ) : null}
          {phase === 'success' ? (
            <button type="button" onClick={resetForm}>
              再填一筆
            </button>
          ) : (
            <button type="submit" disabled={phase === 'submitting' || phase === 'checking'}>
              {phase === 'submitting' ? '送出中…' : '送出詢問'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
