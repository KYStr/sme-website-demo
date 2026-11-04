import type { RouteDef } from '../http/router.ts'
import { listInquiries, patchInquiry, showInquiry } from './admin.ts'
import { health } from './health.ts'
import { createInquiry } from './inquiries.ts'

export function createRoutes(): RouteDef[] {
  return [
    { method: 'GET', path: '/api/health', handler: health },
    { method: 'POST', path: '/api/inquiries', handler: createInquiry },
    { method: 'GET', path: '/api/inquiries', handler: listInquiries },
    { method: 'GET', path: '/api/inquiries/:id', handler: showInquiry },
    { method: 'PATCH', path: '/api/inquiries/:id', handler: patchInquiry },
  ]
}
