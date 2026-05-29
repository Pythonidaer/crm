import { useState, useCallback } from 'react'
import { Button, Card, Text } from '@pythonidaer/ui'
import { LinkButton } from '../../components/LinkButton'
import { LeadTable } from '../../components/LeadTable'
import { LeadCard } from '../../components/LeadCard'
import { LeadFilters } from '../../components/LeadFilters'
import { EmptyState } from '../../components/EmptyState'
import { getLeads, deleteLead, saveLeads } from '../../utils/leadStorage'
import { filterLeads } from '../../utils/leadFilters'
import { sortLeads } from '../../utils/leadSorting'
import { applyDefaults } from '../../utils/leadValidation'
import { MOCK_LEADS } from '../../utils/mockLeadData'
import type { Lead, LeadFilters as LeadFiltersType, LeadSortKey } from '../../types/lead'
import styles from './LeadListPage.module.css'

const VIEW_KEY = 'jonnovative_crm_list_view'

const EMPTY_FILTERS: LeadFiltersType = {
  search: '',
  city: '',
  sector: '',
  selector: '',
  status: '',
  priority: '',
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function LeadListPage() {
  const [leads, setLeads] = useState<Lead[]>(() => getLeads())
  const [view, setView] = useState<'table' | 'card'>(
    () => (localStorage.getItem(VIEW_KEY) as 'table' | 'card') ?? 'table',
  )
  const [filters, setFilters] = useState<LeadFiltersType>(EMPTY_FILTERS)
  const [sortKey, setSortKey] = useState<LeadSortKey>('companyName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function refresh() {
    setLeads(getLeads())
  }

  function handleSort(key: LeadSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function handleViewChange(v: 'table' | 'card') {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  const handleDelete = useCallback((id: string) => {
    if (!confirm('Delete this lead?')) return
    deleteLead(id)
    refresh()
  }, [])

  function handleAddDemo() {
    const existing = getLeads()
    const newLeads = MOCK_LEADS.filter(
      (m) =>
        !existing.some(
          (e) =>
            e.companyName.toLowerCase() === m.companyName.toLowerCase() &&
            e.city.toLowerCase() === m.city.toLowerCase(),
        ),
    ).map((m) => applyDefaults({ ...m, id: generateId() }))
    saveLeads([...existing, ...newLeads])
    refresh()
  }

  const filtered = filterLeads(leads, filters)
  const sorted = sortLeads(filtered, sortKey, sortDir)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Text as="h1" variant="h3" className={styles.title}>Leads</Text>
          <p className={styles.subtitle}>Track and manage your leads and outreach</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {leads.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleAddDemo}>
              Load Demo Data
            </Button>
          )}
          <LinkButton to="/crm/leads/new" variant="primary" size="sm">
            + Add Lead
          </LinkButton>
        </div>
      </div>

      <Card variant="default" padding="md">
        <LeadFilters filters={filters} leads={leads} onChange={setFilters} />
      </Card>

      <div className={styles.toolbar}>
        <span className={styles.total}>
          {filtered.length} of {leads.length} leads
        </span>
        <div className={styles.viewToggle}>
          <Button
            variant={view === 'table' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('table')}
            aria-pressed={view === 'table'}
          >
            Table View
          </Button>
          <Button
            variant={view === 'card' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('card')}
            aria-pressed={view === 'card'}
          >
            Card View
          </Button>
        </div>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon="📋"
          heading="No leads yet"
          description="Add your first lead manually or import a JSON file from the DER employer locator."
        >
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <LinkButton to="/crm/leads/new" variant="primary">Add Lead</LinkButton>
            <LinkButton to="/crm/import" variant="outline">Import JSON</LinkButton>
            <Button variant="ghost" onClick={handleAddDemo}>Load Demo Data</Button>
          </div>
        </EmptyState>
      ) : sorted.length === 0 ? (
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
          onDelete={handleDelete}
        />
      ) : (
        <div className={styles.cardGrid}>
          {sorted.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
