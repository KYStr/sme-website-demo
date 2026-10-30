import { useState, type FormEvent } from 'react'
import { company } from '../data/company.ts'
import styles from './Contact.module.css'

type FieldKey = 'company' | 'name' | 'email' | 'phone' | 'subject' | 'message'

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^0\d{1,3}-\d{3,4}-\d{3,4}$/

function validate(values: FormState) {
  const errors: Partial<Record<FieldKey, string>> = {}
  for (const field of fields) {
    if (!values[field.key].trim()) errors[field.key] = '請填寫此欄位'
  }
  if (values.email.trim() && !emailPattern.test(values.email.trim())) {
    errors.email = '請輸入有效的 Email'
  }
  if (values.phone.trim() && !phonePattern.test(values.phone.trim())) {
    errors.phone = '請輸入有效的電話（例如 04-2000-0000）'
  }
  return errors
}

export function ContactPage() {
  const [values, setValues] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [notice, setNotice] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = validate(values)
    setErrors(next)
    setNotice(Object.keys(next).length === 0)
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={`${styles.kicker} num`}>INQUIRY</p>
        <h1>先把條件寫清楚。</h1>
        <p>這張表單只在瀏覽器裡檢查格式。現在沒有後端，也不會寄出。</p>
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
        <form className={styles.form} data-testid="contact-form" onSubmit={onSubmit} noValidate>
          {fields.map((field) => {
            const error = errors[field.key]
            const inputId = `field-${field.key}`
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
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    aria-required="true"
                    aria-invalid={Boolean(error)}
                    onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                  />
                ) : (
                  <input
                    id={inputId}
                    name={field.key}
                    type={field.type ?? 'text'}
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    aria-required="true"
                    aria-invalid={Boolean(error)}
                    onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                  />
                )}
                {error ? <small role="alert">{error}</small> : null}
              </label>
            )
          })}
          {notice ? (
            <p className={styles.notice} data-testid="form-notice" role="status">
              表單串接將於第 2 步完成，目前尚未送出
            </p>
          ) : null}
          <button type="submit">送出詢問</button>
        </form>
      </div>
    </div>
  )
}
