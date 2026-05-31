import { createServer } from 'node:http'
import { URL } from 'node:url'
import dotenv from 'dotenv'
import { getLeadById, getLeads, updateLeadEditableFields } from '../src/db/leadQueries.ts'
import { parseLeadPatchBody } from '../src/db/leadPatchValidation.ts'
import { closeDb } from '../src/db/client.ts'

dotenv.config({ path: '.env.local' })
dotenv.config()

const PORT = Number(process.env['API_PORT'] ?? 3001)

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(body))
}

function methodNotAllowed(res, allowed) {
  res.writeHead(405, {
    Allow: allowed.join(', '),
    'Content-Type': 'application/json',
  })
  res.end(JSON.stringify({ error: 'Method not allowed' }))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

async function handleGetLeads(_req, res) {
  const leads = await getLeads()
  sendJson(res, 200, leads)
}

async function handleGetLead(_req, res, id) {
  const lead = await getLeadById(id)
  if (!lead) {
    sendJson(res, 404, { error: 'Lead not found' })
    return
  }
  sendJson(res, 200, lead)
}

async function handlePatchLead(req, res, id) {
  const body = await readBody(req)
  const { patch, errors } = parseLeadPatchBody(body)
  if (errors.length > 0) {
    sendJson(res, 400, { error: errors.join('; ') })
    return
  }

  const lead = await updateLeadEditableFields(id, patch)
  if (!lead) {
    sendJson(res, 404, { error: 'Lead not found' })
    return
  }

  sendJson(res, 200, lead)
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, null)
    return
  }

  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    const leadMatch = url.pathname.match(/^\/api\/leads\/([^/]+)$/)

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { ok: true })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/leads') {
      await handleGetLeads(req, res)
      return
    }

    if (req.method === 'GET' && leadMatch) {
      await handleGetLead(req, res, decodeURIComponent(leadMatch[1]))
      return
    }

    if (req.method === 'PATCH' && leadMatch) {
      await handlePatchLead(req, res, decodeURIComponent(leadMatch[1]))
      return
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'Not found' })
      return
    }

    sendJson(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error(err)
    sendJson(res, 500, { error: 'Internal server error' })
  }
})

server.listen(PORT, () => {
  console.log(`CRM API listening on http://localhost:${PORT}`)
})

async function shutdown() {
  await closeDb()
  server.close()
}

process.on('SIGINT', () => {
  shutdown().finally(() => process.exit(0))
})
process.on('SIGTERM', () => {
  shutdown().finally(() => process.exit(0))
})
