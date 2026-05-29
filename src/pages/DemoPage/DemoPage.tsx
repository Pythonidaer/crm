import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Text } from '@pythonidaer/ui'
import { LinkButton } from '../../components/LinkButton'
import { LeadTable } from '../../components/LeadTable'
import { LeadCard } from '../../components/LeadCard'
import { LeadFilters } from '../../components/LeadFilters'
import { EmptyState } from '../../components/EmptyState'
import { MOCK_LEADS } from '../../utils/mockLeadData'
import { filterLeads } from '../../utils/leadFilters'
import { sortLeads } from '../../utils/leadSorting'
import type { LeadFilters as LeadFiltersType, LeadSortKey } from '../../types/lead'
import styles from './DemoPage.module.css'

const EMPTY_FILTERS: LeadFiltersType = {
  search: '',
  city: '',
  sector: '',
  selector: '',
  status: '',
  priority: '',
}

export function DemoPage() {
  const [view, setView] = useState<'table' | 'card'>('table')
  const [filters, setFilters] = useState<LeadFiltersType>(EMPTY_FILTERS)
  const [sortKey, setSortKey] = useState<LeadSortKey>('companyName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(key: LeadSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = filterLeads(MOCK_LEADS, filters)
  const sorted = sortLeads(filtered, sortKey, sortDir)

  const statuses = MOCK_LEADS.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className={styles.logoText}>Jonnovative Leads</span>
          <span className={styles.demoBadge}>Demo Mode</span>
        </div>
        <LinkButton to="/login" variant="outline" size="sm" style={{ color: 'var(--color-neutral-0)', borderColor: 'var(--color-neutral-600)' }}>
          Sign In →
        </LinkButton>
      </div>

      <div className={styles.content}>
        <Text as="h1" variant="h2" className={styles.heading}>Leads</Text>
        <p className={styles.subheading}>
          This is a read-only demo with sample data. <Link to="/login">Sign in</Link> to manage your real leads.
        </p>

        <div className={styles.stats}>
          <Card variant="bordered" padding="md" className={styles.statCard}>
            <div className={styles.statValue}>{MOCK_LEADS.length}</div>
            <div className={styles.statLabel}>Total Leads</div>
          </Card>
          <Card variant="bordered" padding="md" className={styles.statCard}>
            <div className={styles.statValue}>{statuses['not_contacted'] ?? 0}</div>
            <div className={styles.statLabel}>Not Contacted</div>
          </Card>
          <Card variant="bordered" padding="md" className={styles.statCard}>
            <div className={styles.statValue}>{statuses['interested'] ?? 0}</div>
            <div className={styles.statLabel}>Interested</div>
          </Card>
          <Card variant="bordered" padding="md" className={styles.statCard}>
            <div className={styles.statValue}>{statuses['proposal_sent'] ?? 0}</div>
            <div className={styles.statLabel}>Proposals Sent</div>
          </Card>
        </div>

        <Card variant="default" padding="md" style={{ marginBottom: 'var(--space-4)' }}>
          <LeadFilters filters={filters} leads={MOCK_LEADS} onChange={setFilters} />
        </Card>

        <div className={styles.toolbar}>
          <span className={styles.total}>
            {sorted.length} of {MOCK_LEADS.length} leads
          </span>
          <div className={styles.viewToggle}>
            <Button
              variant={view === 'table' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setView('table')}
              aria-pressed={view === 'table'}
            >
              Table
            </Button>
            <Button
              variant={view === 'card' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setView('card')}
              aria-pressed={view === 'card'}
            >
              Cards
            </Button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            icon="🔍"
            heading="No leads match your filters"
            description="Try adjusting your search or clearing filters."
          >
            <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>Clear Filters</Button>
          </EmptyState>
        ) : view === 'table' ? (
          <LeadTable
            leads={sorted}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            readOnly
          />
        ) : (
          <div className={styles.cardGrid}>
            {sorted.map((lead) => (
              <LeadCard key={lead.id} lead={lead} readOnly />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
