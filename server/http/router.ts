import type { Handler } from './context.ts'

export type RouteDef = {
  method: string
  path: string
  handler: Handler
}

type CompiledRoute = RouteDef & {
  regex: RegExp
  keys: string[]
}

export type RouteMatch =
  | { kind: 'ok'; handler: Handler; params: Record<string, string> }
  | { kind: 'method'; allowed: string[] }
  | { kind: 'none' }
  | { kind: 'bad-encoding' }

function compile(path: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = []
  const source = path
    .split('/')
    .map((part) => {
      if (part.startsWith(':')) {
        keys.push(part.slice(1))
        return '([^/]+)'
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return { regex: new RegExp(`^${source}$`), keys }
}

export function compileRoutes(routes: RouteDef[]): CompiledRoute[] {
  return routes.map((route) => ({ ...route, ...compile(route.path) }))
}

export function matchRoute(routes: CompiledRoute[], method: string, pathname: string): RouteMatch {
  const hits = routes.filter((route) => route.regex.test(pathname))
  if (hits.length === 0) return { kind: 'none' }
  const found = hits.find((route) => route.method === method)
  if (!found) {
    return { kind: 'method', allowed: [...new Set(hits.map((route) => route.method))] }
  }
  const exec = found.regex.exec(pathname)
  if (!exec) return { kind: 'none' }
  const params: Record<string, string> = {}
  try {
    found.keys.forEach((key, index) => {
      params[key] = decodeURIComponent(exec[index + 1] ?? '')
    })
  } catch {
    return { kind: 'bad-encoding' }
  }
  return { kind: 'ok', handler: found.handler, params }
}
