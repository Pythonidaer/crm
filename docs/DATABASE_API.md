# Database API (Neon + Vercel)

The CRM can load and save leads from Neon Postgres when database mode is enabled. Database access happens only in server-side API routes — `DATABASE_URL` is never exposed to the browser.

## Production (Vercel)

Deploy the Vite app and serverless API routes together on Vercel.

### Required Vercel environment variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | Server | Neon Postgres connection string (use the pooled connection string from Neon dashboard) |
| `VITE_USE_DATABASE_LEADS` | Build | Set to `true` to enable database mode in the UI |

`VITE_API_BASE_URL` is **not** needed when frontend and API share the same Vercel domain (calls go to `/api/leads`).

### API routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/health` | GET | Health check `{ ok: true }` |
| `/api/leads` | GET | List all leads (sorted by display/company name) |
| `/api/leads/:id` | GET, PATCH | Read or update editable CRM fields |

PATCH accepts only editable CRM/qualification fields. Source and enrichment fields (company name, phone, website, email, Google/enrichment metadata) cannot be overwritten from the frontend.

### Seed Neon before first production use

Run locally against the same Neon database:

```bash
pnpm db:push
pnpm db:seed
```

This reads `src/utils/leads/salem-leads.enriched.json` and upserts into Postgres, preserving any existing CRM edits.

### Verify after deploy

1. Open `https://YOUR_DOMAIN/api/health` — should return `{ "ok": true }`
2. Open `https://YOUR_DOMAIN/api/leads` — should return a JSON array of leads
3. Open the CRM with database mode enabled — leads table should load from the API
4. Edit a lead, click **Save Lead**, refresh — changes should persist in Neon

## Local development

```bash
pnpm db:push          # push schema to Neon
pnpm db:seed          # upsert seed JSON into Neon
pnpm dev:full         # Vite + local API (proxy /api → localhost:3001)
```

Or run separately:

```bash
pnpm dev:api          # local API on port 3001
pnpm dev              # Vite dev server with /api proxy
```

Add to `.env.local`:

```env
DATABASE_URL=postgresql://...
VITE_USE_DATABASE_LEADS=true
```

## JSON fallback

When `VITE_USE_DATABASE_LEADS` is `false` or unset, the app uses bundled JSON + `localStorage` as before.

## Shared server code

| Path | Purpose |
|------|---------|
| `lib/db/schema.ts` | Drizzle schema |
| `lib/db/client.ts` | Postgres client |
| `lib/db/leadQueries.ts` | `getLeads`, `getLeadById`, `updateLeadEditableFields` |
| `lib/db/leadPatchValidation.ts` | PATCH body parsing/validation |
| `lib/db/leadMapper.ts` | Row ↔ Lead mapping |
| `api/*.ts` | Vercel serverless routes |
| `scripts/dev-api-server.js` | Local dev API using the same query helpers |
