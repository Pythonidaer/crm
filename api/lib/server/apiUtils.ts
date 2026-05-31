import type { VercelResponse } from '@vercel/node'
import type { ApiResult } from './leadsHandlers'

export function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json').json(body)
}

export function sendResult(res: VercelResponse, result: ApiResult): void {
  sendJson(res, result.status, result.body)
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '))
  sendJson(res, 405, { error: 'Method not allowed' })
}
