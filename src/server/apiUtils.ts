import type { VercelResponse } from '@vercel/node'

export function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json').json(body)
}

export async function sendWebResponse(res: VercelResponse, response: Response): Promise<void> {
  const body = await response.text()
  res.status(response.status)
  res.setHeader('Content-Type', response.headers.get('content-type') ?? 'application/json')
  res.send(body)
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '))
  sendJson(res, 405, { error: 'Method not allowed' })
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function handleApiError(res: VercelResponse, err: unknown): void {
  console.error('[api]', err)

  const message = errorMessage(err)
  if (message.includes('DATABASE_URL')) {
    sendJson(res, 503, { error: 'Database not configured' })
    return
  }

  sendJson(res, 500, { error: 'Internal server error' })
}

export function jsonResponse(status: number, body: unknown): Response {
  return Response.json(body, { status })
}

export function handleApiErrorResponse(err: unknown): Response {
  console.error('[api]', err)

  const message = errorMessage(err)
  if (message.includes('DATABASE_URL')) {
    return jsonResponse(503, { error: 'Database not configured' })
  }

  return jsonResponse(500, { error: 'Internal server error' })
}
