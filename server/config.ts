import { randomBytes } from 'node:crypto'

export const BODY_LIMIT_BYTES = 32 * 1024

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4174',
  'http://127.0.0.1:4174',
]

const MIN_SECRET_LENGTH = 16

export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

export type Config = {
  host: string
  port: number
  nodeEnv: string
  adminKey: string | null
  adminDisabledReason: string | null
  dbPath: string
  allowedOrigins: string[]
  formSecret: string
  formSecretEphemeral: boolean
  trustProxy: boolean
  bodyLimit: number
  version: string
}

function parsePort(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') return 3001
  if (!/^\d+$/.test(raw.trim())) {
    throw new ConfigError(`PORT 必須是 1 到 65535 的整數，收到的值無法解讀`)
  }
  const port = Number(raw)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError(`PORT 必須是 1 到 65535 的整數，收到的值無法解讀`)
  }
  return port
}

function parseOrigins(raw: string | undefined): string[] {
  const items = (raw ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  return [...new Set(items)]
}

function parseAdminKey(raw: string | undefined): { adminKey: string | null; adminDisabledReason: string | null } {
  if (raw === undefined || raw.trim() === '') {
    return { adminKey: null, adminDisabledReason: '未設定 ADMIN_KEY，管理列表 API 已停用' }
  }
  const adminKey = raw.trim()
  if (adminKey.length < MIN_SECRET_LENGTH) {
    return { adminKey: null, adminDisabledReason: 'ADMIN_KEY 長度不足 16，管理列表 API 已停用' }
  }
  return { adminKey, adminDisabledReason: null }
}

function parseFormSecret(raw: string | undefined): { formSecret: string; formSecretEphemeral: boolean } {
  const secret = raw?.trim() ?? ''
  if (secret === '') return { formSecret: randomBytes(32).toString('hex'), formSecretEphemeral: true }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new ConfigError('FORM_SECRET 若有設定，長度至少要 16')
  }
  return { formSecret: secret, formSecretEphemeral: false }
}

export function loadConfig(env: NodeJS.ProcessEnv, version: string): Config {
  const nodeEnv = env.NODE_ENV?.trim() || 'development'
  const host = env.HOST?.trim() || '127.0.0.1'
  if (host.length === 0) throw new ConfigError('HOST 不能是空字串')

  const allowedOrigins = parseOrigins(env.ALLOWED_ORIGINS)
  if (nodeEnv !== 'production') {
    for (const origin of DEV_ORIGINS) {
      if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin)
    }
  }

  return {
    host,
    port: parsePort(env.PORT),
    nodeEnv,
    ...parseAdminKey(env.ADMIN_KEY),
    dbPath: env.DB_PATH?.trim() || 'data/inquiries.db',
    allowedOrigins,
    ...parseFormSecret(env.FORM_SECRET),
    trustProxy: env.TRUST_PROXY === '1',
    bodyLimit: BODY_LIMIT_BYTES,
    version,
  }
}
