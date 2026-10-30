export function routerBasename() {
  const trimmed = import.meta.env.BASE_URL.replace(/\/$/, '')
  return trimmed === '' ? '/' : trimmed
}
