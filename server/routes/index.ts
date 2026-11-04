import type { RouteDef } from '../http/router.ts'
import { health } from './health.ts'
import { createInquiry } from './inquiries.ts'

export function createRoutes(): RouteDef[] {
  return [
    { method: 'GET', path: '/api/health', handler: health },
    { method: 'POST', path: '/api/inquiries', handler: createInquiry },
  ]
}
