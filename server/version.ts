import { readFileSync } from 'node:fs'

export function readPackageVersion(): string {
  const file = new URL('../package.json', import.meta.url)
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as { version?: unknown }
  if (typeof parsed.version !== 'string' || parsed.version.trim() === '') {
    throw new Error('package.json 缺少 version')
  }
  return parsed.version
}
