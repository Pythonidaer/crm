import type { VercelResponse } from '@vercel/node'

export function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json').json(body)
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '))
  sendJson(res, 405, { error: 'Method not allowed' })
}

export function handleApiError(res: VercelResponse, err: unknown): void {
  console.error(err)
  sendJson(res, 500, { error: 'Internal server error' })
}
