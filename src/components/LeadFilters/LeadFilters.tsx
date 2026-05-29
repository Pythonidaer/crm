import { Input, Select, Button } from '@pythonidaer/ui'
import type { LeadFilters as LeadFiltersType, Lead } from '../../types/lead'
import { getUniqueValues } from '../../utils/leadFilters'
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

interface LeadFiltersProps {
  filters: LeadFiltersType
  leads: Lead[]
  onChange: (filters: LeadFiltersType) => void
}

export function LeadFilters({ filters, leads, onChange }: LeadFiltersProps) {
  const cities = getUniqueValues(leads, 'city')
  const sectors = getUniqueValues(leads, 'sector')
  const selectors = getUniqueValues(leads, 'selector')

  function set(key: keyof LeadFiltersType, value: string) {
    onChange({ ...filters, [key]: value })
  }

  function clear() {
    onChange({ search: '', city: '', sector: '', selector: '', status: '', priority: '' })
  }

  const hasFilters =
    filters.search || filters.city || filters.sector || filters.selector ||
    filters.status || filters.priority

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
          value={filters.selector}
          onChange={(e) => set('selector', e.target.value)}
          aria-label="Filter by selector"
          options={[
            { value: '', label: 'All Selectors' },
            ...selectors.map((s) => ({ value: s, label: s })),
          ]}
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
