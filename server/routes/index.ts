import type { RouteDef } from '../http/router.ts'
import { health } from './health.ts'

export function createRoutes(): RouteDef[] {
  return [{ method: 'GET', path: '/api/health', handler: health }]
}
