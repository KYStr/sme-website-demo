import { defineConfig } from '@playwright/test'

const apiEnv = {
  PORT: '3001',
  HOST: '127.0.0.1',
  ADMIN_KEY: 'playwright-admin-key',
  FORM_SECRET: 'playwright-form-secret-0123456789',
  DB_PATH: 'data/e2e.sqlite',
  NODE_ENV: 'test',
}

export default defineConfig({
  testDir: 'tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4174',
  },
  webServer: [
    {
      command: 'node --disable-warning=ExperimentalWarning server/seed.ts --reset && node --disable-warning=ExperimentalWarning server/index.ts',
      url: 'http://127.0.0.1:3001/api/health',
      env: apiEnv,
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4174',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: false,
      timeout: 180000,
    },
  ],
})
