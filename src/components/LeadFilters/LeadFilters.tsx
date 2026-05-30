import { Input, Select, Button } from '@pythonidaer/ui'
import type { LeadFilters as LeadFiltersType, Lead } from '../../types/lead'
import { EMPTY_LEAD_FILTERS, getUniqueValues } from '../../utils/leadFilters'
import styles from './LeadFilters.module.css'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'called', label: 'Called' },
  { value: 'interested', label: 'Interested' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const MATCH_CONFIDENCE_OPTIONS = [
  { value: '', label: 'All Match Confidence' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'None' },
]

const LEAD_FIT_OPTIONS = [
  { value: '', label: 'All Lead Fit' },
  { value: 'strong', label: 'Strong' },
  { value: 'medium', label: 'Medium' },
  { value: 'weak', label: 'Weak' },
  { value: 'disqualified', label: 'Disqualified' },
]

const ENRICHMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Enrichment Status' },
  { value: 'matched', label: 'Matched' },
  { value: 'review_needed', label: 'Review Needed' },
  { value: 'not_found', label: 'Not Found' },
  { value: 'error', label: 'Error' },
  { value: 'not_enriched', label: 'Not Enriched' },
]

interface LeadFiltersProps {
  filters: LeadFiltersType
  leads: Lead[]
  onChange: (filters: LeadFiltersType) => void
}

export function LeadFilters({ filters, leads, onChange }: LeadFiltersProps) {
  const cities = getUniqueValues(leads, 'city')
  const sectors = getUniqueValues(leads, 'sector')

  function set(key: keyof LeadFiltersType, value: string) {
    onChange({ ...filters, [key]: value })
  }

  function clear() {
    onChange(EMPTY_LEAD_FILTERS)
  }

  const hasFilters = Object.entries(filters).some(([, value]) => Boolean(value))

  return (
    <div className={styles.wrapper} role="search" aria-label="Filter leads">
      <div className={styles.searchWrap}>
        <Input
          type="search"
          placeholder="Search leads…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          aria-label="Search leads"
          size="md"
        />
      </div>

      <div className={styles.selectWrap}>
        <Select
          value={filters.city}
          onChange={(e) => set('city', e.target.value)}
          aria-label="Filter by city"
          options={[
            { value: '', label: 'All Cities' },
            ...cities.map((c) => ({ value: c, label: c })),
          ]}
        />
      </div>

      <div className={styles.selectWrap}>
        <Select
          value={filters.sector}
          onChange={(e) => set('sector', e.target.value)}
          aria-label="Filter by sector"
          options={[
            { value: '', label: 'All Sectors' },
            ...sectors.map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>

      <div className={styles.selectWrap}>
        <Select
          value={filters.matchConfidence}
          onChange={(e) => set('matchConfidence', e.target.value)}
          aria-label="Filter by match confidence"
          options={MATCH_CONFIDENCE_OPTIONS}
        />
      </div>

      <div className={styles.selectWrap}>
        <Select
          value={filters.leadFitTier}
          onChange={(e) => set('leadFitTier', e.target.value)}
          aria-label="Filter by lead fit tier"
          options={LEAD_FIT_OPTIONS}
        />
      </div>

      <div className={styles.selectWrap}>
        <Select
          value={filters.hasWebsite}
          onChange={(e) => set('hasWebsite', e.target.value)}
          aria-label="Filter by website availability"
          options={[
            { value: '', label: 'Website: Any' },
            { value: 'yes', label: 'Has Website' },
            { value: 'no', label: 'No Website' },
          ]}
        />
      </div>

      <div className={styles.selectWrap}>
        <Select
          value={filters.hasPhone}
          onChange={(e) => set('hasPhone', e.target.value)}
          aria-label="Filter by phone availability"
          options={[
            { value: '', label: 'Phone: Any' },
            { value: 'yes', label: 'Has Phone' },
            { value: 'no', label: 'No Phone' },
          ]}
        />
      </div>

      <div className={styles.selectWrap}>
        <Select
          value={filters.enrichmentStatus}
          onChange={(e) => set('enrichmentStatus', e.target.value)}
          aria-label="Filter by enrichment status"
          options={ENRICHMENT_STATUS_OPTIONS}
        />
      </div>

      <div className={styles.selectWrap}>
        <Select
          value={filters.status}
          onChange={(e) => set('status', e.target.value)}
          aria-label="Filter by status"
          options={STATUS_OPTIONS}
        />
      </div>

      <div className={styles.selectWrap}>
        <Select
          value={filters.priority}
          onChange={(e) => set('priority', e.target.value)}
          aria-label="Filter by priority"
          options={PRIORITY_OPTIONS}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className={styles.clearBtn}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}
