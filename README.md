# Jonnovative CRM

A local-first CRM for tracking freelance web development leads, built with React, TypeScript, and Vite. Designed for personal use — all data lives in your browser's `localStorage`.

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

All other fields (`address`, `sector`, `selector`, `phone`, `website`, `status`, `priority`, etc.) are optional and receive safe defaults.

### Full lead shape

```typescript
{
  id: string
  companyName: string
  address: string
  city: string
  state: string             // default: "MA"
  sector: string
  selector: string
  phone: string
  website: string
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

The `enrichLeadWithPlaces(lead)` utility in `src/utils/placesEnrichment.ts` is designed for future enrichment of lead data (phone, website, formatted address, Google Maps URL).

### Current behavior

- If no `VITE_GOOGLE_PLACES_KEY` environment variable is set, **mocked data** is returned for known demo leads.
- The enrichment panel on the lead detail page shows a notice that the API key is not configured.

### Adding live enrichment (future)

> **Do NOT call the Google Places API directly from the browser in production.** The API key will be exposed in network requests.

The correct approach:

1. Create a serverless/edge function (Vercel, Netlify, Cloudflare Workers, etc.) that accepts `{ companyName, city, address }` and proxies the Places API call.
2. Store `VITE_GOOGLE_PLACES_KEY` only for local development with a key that has strict referrer/IP restrictions.
3. Update `enrichLeadWithPlaces` to call your backend proxy instead.

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
│   └── placesEnrichment.ts
└── styles/             # Global CSS
```
