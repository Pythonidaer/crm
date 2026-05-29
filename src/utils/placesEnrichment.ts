/// <reference types="vite/client" />
import type { Lead } from '../types/lead'

/**
 * Enrichment result from Google Places API.
 *
 * IMPORTANT — API KEY SECURITY:
 * Never call the Google Places API directly from the frontend in production.
 * The API key will be exposed in network requests.
 * Instead, create a backend function (serverless/edge) that proxies the request
 * and keeps the key server-side. Configure VITE_GOOGLE_PLACES_KEY only for
 * local development testing with a restricted key.
 */
export interface EnrichmentResult {
  phone?: string
  website?: string
  formattedAddress?: string
  googleMapsUrl?: string
}

const MOCK_ENRICHMENT: Record<string, EnrichmentResult> = {
  'aquafisk inc': {
    phone: '(978) 555-0101',
    website: 'https://aquafisk.example.com',
    formattedAddress: 'Colonial Rd #28, Salem, MA 01970',
    googleMapsUrl: 'https://maps.google.com/?cid=mock-aquafisk',
  },
  'atc security': {
    phone: '(978) 555-0102',
    website: 'https://atcsecurity.example.com',
    formattedAddress: 'Cavendish Cir, Salem, MA 01970',
    googleMapsUrl: 'https://maps.google.com/?cid=mock-atcsecurity',
  },
}

/**
 * Enriches a lead with data from Google Places.
 * Returns mocked data when no API key is configured.
 */
export async function enrichLeadWithPlaces(
  lead: Lead,
): Promise<EnrichmentResult> {
  const apiKey = import.meta.env['VITE_GOOGLE_PLACES_KEY']

  if (!apiKey) {
    // Return mock data if available, otherwise empty result
    const mockKey = lead.companyName.toLowerCase()
    return MOCK_ENRICHMENT[mockKey] ?? {}
  }

  // TODO: Replace with a backend proxy call that keeps the API key server-side.
  // Example: POST /api/enrich with { companyName, city, address }
  // The backend searches Places API and returns enriched fields.
  throw new Error(
    'Live Places enrichment requires a backend proxy. See placesEnrichment.ts for details.',
  )
}

export function isEnrichmentAvailable(): boolean {
  return Boolean(import.meta.env['VITE_GOOGLE_PLACES_KEY'])
}
