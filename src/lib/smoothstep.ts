export function smoothstep(edge0: number, edge1: number, x: number) {
  const span = edge1 - edge0
  if (span === 0) return x < edge0 ? 0 : 1
  const t = Math.min(1, Math.max(0, (x - edge0) / span))
  return t * t * (3 - 2 * t)
}

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}
