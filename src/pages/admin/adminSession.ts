import { useEffect } from 'react'

const STORAGE_KEY = 'ff-admin-key'

export function readAdminKey() {
  return sessionStorage.getItem(STORAGE_KEY) ?? ''
}

export function writeAdminKey(value: string) {
  sessionStorage.setItem(STORAGE_KEY, value)
}

export function clearAdminKey() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.append(meta)
    return () => meta.remove()
  }, [])
}
