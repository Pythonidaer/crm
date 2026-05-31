# Jonnovative CRM

A CRM for tracking freelance web development leads, built with React, TypeScript, and Vite. Supports local JSON/`localStorage` mode or Neon Postgres-backed persistence on Vercel.

---

## Getting Started

```bash
pnpm install
pnpm dev         # start dev server at http://localhost:5173
pnpm build       # production build
pnpm test        # run tests
pnpm test:ui     # open Vitest UI
```

The default password is **`jonnovative2024`**. Change it from the Settings page after first login.

---

## Deployment (Vercel + Neon)

Production database mode uses Vercel serverless API routes and Neon Postgres.

### Vercel environment variables

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string (server-only) |
| `VITE_USE_DATABASE_LEADS` | `true` |

### Seed Neon (run locally against the same database)

```bash
pnpm db:push
pnpm db:seed
```

### Local database dev

```bash
pnpm dev:full    # Vite + local API with /api proxy
```

See [`docs/DATABASE_API.md`](docs/DATABASE_API.md) for API routes, verification steps, and fallback behavior.

---

## How localStorage Auth Works

Authentication is intentionally simple:

- The password is stored in `localStorage` under `jonnovative_crm_password` (plaintext).
- When you log in, a flag `jonnovative_crm_auth = "true"` is set.
- `ProtectedRoute` checks this flag on every render. If absent, it redirects to `/login`.
- Logging out removes the auth flag but leaves lead data intact.

> **Security caveat:** This is NOT production-grade security. The password is visible in DevTools and there is no hashing, rate-limiting, or session expiry. This tool is intended for personal, single-device, local-only use. Never store genuinely sensitive data here.

---

## Importing DER Lead Data

The Massachusetts [Department of Employment Research Employer Locator](https://lmi.dua.eol.mass.gov/lmi/employerlocator) provides public data on businesses by city/sector.

To import it:

1. Export or copy the data and format it as a JSON array.
2. Go to `/crm/import` in the app.
3. Paste the JSON and click **Validate & Preview**, then **Import**.

### Minimum required fields

```json
[
  {
    "companyName": "Acme Inc",
    "city": "Salem"
  }
]
```

All other fields (`address`, `sector`, `phone`, `website`, `status`, `priority`, etc.) are optional and receive safe defaults.

### Full lead shape

```typescript
{
  id: string
  companyName: string
  address: string
  city: string
  state: string             // default: "MA"
  sector: string
  phoneNumber: string | null
  website: string | null
  matchConfidence: "high" | "medium" | "low" | null
  leadFitScore: number
  leadFitTier: "strong" | "medium" | "weak" | "disqualified"
  status: "not_contacted" | "called" | "interested" | "follow_up" | "proposal_sent" | "won" | "lost"
  priority: "low" | "medium" | "high"
  contactName: string
  contactRole: string
  contactEmail: string
  lastContactedAt: string   // ISO 8601
  nextFollowUpAt: string    // ISO 8601
  notes: string
  qualification: {
    hasWebsite: boolean
    websiteNeedsWork: boolean
    accessibilityOpportunity: boolean
    seoOpportunity: boolean
    aeoOpportunity: boolean
    decisionMakerFound: boolean
  }
  sourceUrl: string
  createdAt: string
  updatedAt: string
}
```

---

## Exporting Leads

Go to `/crm/export` to:

- **Copy JSON** — copy all lead data to clipboard.
- **Download .json** — download a timestamped backup file.

Use this to back up your data or transfer it to another device.

---

## Google Places Enrichment

Local batch enrichment uses the **Google Places API (New)** via [`scripts/enrich-google-places.js`](scripts/enrich-google-places.js). It reads DER lead JSON from `src/utils/derData/` and writes enriched output to `src/utils/enrichedData/` **without modifying the original DER files**.

### Data model notes

- **`sector`** is the real DER business sector and is kept in the CRM, filters, and table.
- **`selector`** was redundant and has been removed from the CRM model, UI, filters, and exports. Legacy DER source files may still contain a `selector` field; it is ignored on import.

### What enrichment provides

- Phone number, website, Google Maps URL, Google Place ID, and business status (when Google has them)
- **Email is not expected from Google Places** — output sets `email` to `null` unless the input row already had one
- Match confidence scoring routes results into separate output files (see below)

### Setup

1. Copy [`.env.example`](.env.example) to `.env.local` (gitignored).
2. Set `GOOGLE_MAPS_API_KEY=` with a key restricted by **IP** for local script use.
3. Enable **Places API (New)** in Google Cloud Console.

### Commands

```bash
pnpm enrich:places:dry-run              # first 10 leads, logs only, no file writes
pnpm enrich:places -- --limit=10        # enrich 10 leads and write output files
pnpm enrich:places -- --limit=25        # test a larger batch
pnpm enrich:places                      # all ~2,219 DER leads
pnpm enrich:places -- --force --limit=5 # re-enrich even if googlePlaceId exists
```

CLI flags: `--dry-run`, `--limit=N`, `--force`, `--delay=MS` (default 250), `--write` (allow writes during dry run).

### Output files

| File | Contents |
|------|----------|
| `src/utils/enrichedData/google-places-enriched.json` | High-confidence matches with phone/website populated |
| `src/utils/enrichedData/google-places-review-needed.json` | Medium/low confidence — review before trusting contact fields |
| `src/utils/enrichedData/google-places-not-found.json` | No Google result for the search query |
| `src/utils/enrichedData/google-places-errors.json` | API or parse failures |

### Billing warning

There are **~2,219 DER leads**. Each lead uses **2 API calls** (Text Search + Place Details), so a full run is roughly **~4,400 billable requests**. Always test with `pnpm enrich:places:dry-run` or `--limit=10` first and check your Google Cloud billing dashboard before running the full batch.

### In-app enrichment (separate)

The `enrichLeadWithPlaces(lead)` utility in `src/utils/placesEnrichment.ts` still returns mocked data in the browser. The CRM list now loads the merged enriched dataset below.

---

## Merged CRM Dataset

After Google Places enrichment, merge DER source data with enrichment output into one app-ready file:

```bash
pnpm merge:leads
```

### Data pipeline

| Stage | Location | Purpose |
|-------|----------|---------|
| Raw DER source | `src/utils/derData/salem-*.json` | Original employer locator exports (unchanged) |
| Enrichment output | `src/utils/enrichedData/google-places-*.json` | Google Places API results by confidence bucket |
| App-ready CRM data | `src/utils/leads/salem-leads.enriched.json` | Merged, scored leads used by the CRM |

### Terminology

- **`sector`** — real DER business sector (kept everywhere)
- **`selector`** — removed from the CRM model; legacy DER files may still contain it
- **Match confidence** — how sure we are the Google Places match is correct (`high`, `medium`, `low`)
- **Lead fit score / tier** — how worth contacting the business is for outreach (`strong`, `medium`, `weak`, `disqualified`)

The CRM auto-seeds from `salem-leads.enriched.json` on first load when localStorage is empty.

---

## App Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/demo` |
| `/demo` | Public read-only demo with sample data |
| `/login` | Password login screen |
| `/crm/leads` | Lead list (table or card view) |
| `/crm/leads/:id` | Lead detail & edit form |
| `/crm/leads/new` | Add new lead |
| `/crm/import` | Import leads from JSON |
| `/crm/export` | Export leads to JSON |
| `/crm/scripts` | Call scripts and qualification guide |
| `/crm/settings` | Change password, clear data, export backup |

---

## Design System

This app uses `@pythonidaer/ui` and `@pythonidaer/tokens` (Jonnovative design system).

### Components from `@pythonidaer/ui` used:
`Button`, `Card`, `Input`, `Select`, `TextArea`, `Checkbox`, `FormField`, `Stack`, `Container`, `Text`, `Box`

### Local components (not yet in design system):
These were built locally and should be added to `@pythonidaer/ui`:

| Component | Notes |
|-----------|-------|
| `LeadStatusBadge` | Colored pill badge for all 7 lead statuses |
| `LeadTable` | Accessible sortable table with sort headers |
| `AppLayout` | Sidebar + main content layout shell |
| `EmptyState` | Icon + heading + optional CTA block |

Future additions to consider: `Modal/Dialog`, `Pagination`, `Tabs`, `Toast/Notification`.

---

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── AppLayout/      # Sidebar navigation layout
│   ├── EmptyState/     # Empty state placeholder
│   ├── LeadCard/       # Card view tile for a lead
│   ├── LeadFilters/    # Search + filter bar
│   ├── LeadForm/       # Full lead edit form
│   ├── LeadStatusBadge/# Status pill badge
│   ├── LeadTable/      # Sortable leads table
│   └── ProtectedRoute/ # Auth guard component
├── pages/              # Route-level page components
├── types/              # TypeScript types (lead.ts)
├── utils/              # Business logic utilities
│   ├── authStorage.ts
│   ├── leadFilters.ts
│   ├── leadImportExport.ts
│   ├── leadSorting.ts
│   ├── leadStorage.ts
│   ├── leadValidation.ts
│   ├── mockLeadData.ts
│   ├── placesEnrichment.ts
│   ├── derData/            # DER source JSON (read-only)
│   ├── enrichedData/       # Google Places enrichment output
│   └── leads/              # Merged app-ready CRM dataset
└── styles/             # Global CSS
api/                    # Vercel serverless routes (/api/leads, /api/health)
lib/                    # Server-only DB schema, queries, API handlers
scripts/                # DB seed/push and local dev API
docs/                   # Deployment and database docs
```
