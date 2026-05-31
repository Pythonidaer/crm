import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

execSync('pnpm exec drizzle-kit push', {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})
