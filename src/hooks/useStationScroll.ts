import { useEffect, type RefObject } from 'react'

// A wheel gesture chooses a station immediately. The camera eases to it while
// the copy switches to a single heading, so a busy WebGL frame cannot strand
// the page halfway between two headings.
export function useStationScroll(ref: RefObject<HTMLElement | null>, enabled: boolean, count: number) {
  useEffect(() => {
    const node = ref.current
    if (!enabled || !node) return

    let settleTimer = 0
    let lastWheel = 0
    let touching = false

    const top = () => node.getBoundingClientRect().top + window.scrollY
    const end = () => top() + (count - 1) * window.innerHeight
    const indexAt = () => Math.max(0, Math.min(count - 1, Math.round((window.scrollY - top()) / window.innerHeight)))
    const goTo = (index: number) => {
      window.clearTimeout(settleTimer)
      window.scrollTo(0, top() + Math.max(0, Math.min(count - 1, index)) * window.innerHeight)
      window.dispatchEvent(new Event('scroll'))
    }

    const settle = () => {
      if (touching) return
      const y = window.scrollY
      if (y < top() - 2 || y >= end()) return
      const target = top() + indexAt() * window.innerHeight
      if (Math.abs(y - target) > 3) goTo(indexAt())
    }

    const onScroll = () => {
      if (touching) return
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(settle, 180)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.deltaY === 0) return
      const y = window.scrollY
      if (y < top() - 2 || y > end() + 2) return
      if (event.deltaY > 0 && y >= end() - 2) return
      if (event.deltaY < 0 && y <= top() + 2) return
      event.preventDefault()

      const now = performance.now()
      if (lastWheel !== 0 && now - lastWheel < 280) {
        lastWheel = now
        return
      }
      lastWheel = now
      goTo(indexAt() + Math.sign(event.deltaY))
    }

    const onTouchStart = () => {
      touching = true
      window.clearTimeout(settleTimer)
    }
    const onTouchEnd = () => {
      touching = false
      onScroll()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    node.dataset.scrollReady = 'true'
    return () => {
      delete node.dataset.scrollReady
      window.clearTimeout(settleTimer)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [ref, enabled, count])
}
