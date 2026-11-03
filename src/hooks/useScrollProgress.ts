import { useEffect, useState, type RefObject } from 'react'

export function useScrollProgress(ref: RefObject<HTMLElement | null>, onProgress: (progress: number) => void, enabled: boolean) {
  useEffect(() => {
    const element = ref.current
    if (!enabled || !element) return
    const update = () => {
      const rect = element.getBoundingClientRect()
      const total = element.offsetHeight - window.innerHeight
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0))
      onProgress(total > 0 ? scrolled / total : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref, onProgress, enabled])
}

export function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function useWebGLSupport() {
  const [supported] = useState(() => {
    try {
      const canvas = document.createElement('canvas')
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      return false
    }
  })
  return supported
}
