import { journeyStations } from '../data/journey.ts'
import { smoothstep } from '../lib/smoothstep.ts'

export function syncJourneyOverlay(node: HTMLElement | null, progress: number) {
  if (!node) return
  const active = Math.round(progress * (journeyStations.length - 1))
  const overlay = node.querySelector<HTMLElement>('[data-testid="journey-overlay"]')
  if (overlay) overlay.dataset.activeStation = String(active)
  node.querySelectorAll<HTMLElement>('[data-journey-index]').forEach((card) => {
    const index = Number(card.dataset.journeyIndex)
    const center = index / (journeyStations.length - 1)
    const opacity = 1 - smoothstep(0.065, 0.1, Math.abs(progress - center))
    card.style.opacity = String(opacity)
    card.style.transform = `translate3d(0, ${(progress - center) * 36}px, 0)`
    card.style.visibility = opacity < 0.04 ? 'hidden' : 'visible'
    card.setAttribute('aria-hidden', String(index !== active))
    card.inert = index !== active
  })
  node.querySelectorAll<HTMLElement>('[data-journey-tick]').forEach((tick) => {
    tick.dataset.on = String(Number(tick.dataset.journeyTick) === active)
  })
}
