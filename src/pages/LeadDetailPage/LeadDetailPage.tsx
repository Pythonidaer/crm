import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, Card, Text } from '@pythonidaer/ui'
import { LeadForm } from '../../components/LeadForm'
import { LeadStatusBadge } from '../../components/LeadStatusBadge'
import { getLead, upsertLead } from '../../utils/leadStorage'
import { applyDefaults } from '../../utils/leadValidation'
import { enrichLeadWithPlaces, isEnrichmentAvailable } from '../../utils/placesEnrichment'
import {
  fetchLeadFromApi,
  isDatabaseLeadsEnabled,
  leadToPatchInput,
  patchLeadViaApi,
} from '../../utils/leadApi'
import type { Lead } from '../../types/lead'
import type { EnrichmentResult } from '../../utils/placesEnrichment'
import styles from './LeadDetailPage.module.css'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const useDatabase = isDatabaseLeadsEnabled()

  const [lead, setLead] = useState<Lead | null>(() => {
    if (isNew) {
      return applyDefaults({ id: generateId(), city: 'Salem', state: 'MA' })
    }
    if (useDatabase) return null
    return getLead(id ?? '') ?? null
  })

  const [loading, setLoading] = useState(useDatabase && !isNew)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [enriching, setEnriching] = useState(false)
  const [enrichResult, setEnrichResult] = useState<EnrichmentResult | null>(null)

  useEffect(() => {
    if (isNew || !id) return

    if (useDatabase) {
      setLoading(true)
      setLoadError(null)
      fetchLeadFromApi(id)
        .then((found) => setLead(found))
        .catch((err) => setLoadError(String(err)))
        .finally(() => setLoading(false))
      return
    }

    const found = getLead(id)
    if (!found) navigate('/crm/leads')
    else setLead(found)
  }, [id, isNew, navigate, useDatabase])

  async function handleSave(updated: Lead) {
    setSaveError(null)

    if (useDatabase && !isNew) {
      setSaving(true)
      try {
        const saved = await patchLeadViaApi(updated.id, leadToPatchInput(updated))
        setLead(saved)
        navigate('/crm/leads')
      } catch (err) {
        setSaveError(String(err))
        setLead(updated)
      } finally {
        setSaving(false)
      }
      return
    }

    upsertLead(updated)
    navigate('/crm/leads')
  }

  async function handleEnrich() {
    if (!lead) return
    setEnriching(true)
    try {
      const result = await enrichLeadWithPlaces(lead)
      setEnrichResult(result)
      setLead((prev) =>
        prev
          ? {
              ...prev,
              phoneNumber: result.phone ?? prev.phoneNumber,
              website: result.website ?? prev.website,
            }
          : prev,
      )
    } catch (err) {
      alert(String(err))
    } finally {
      setEnriching(false)
    }
  }

  if (loading) {
    return <p>Loading lead…</p>
  }

  if (loadError) {
    return (
      <p>
        Failed to load lead: {loadError}. <Link to="/crm/leads">Go back</Link>
      </p>
    )
  }

  if (!lead) {
    return <p>Lead not found. <Link to="/crm/leads">Go back</Link></p>
  }

  return (
    <div className={styles.page}>
      <Link to="/crm/leads" className={styles.backLink}>← Back to Leads</Link>

      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Text as="h1" variant="h3">
            {isNew ? 'Add New Lead' : lead.companyName}
          </Text>
          {!isNew && (
            <div className={styles.titleMeta}>
              <LeadStatusBadge status={lead.status} />
              <span style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)' }}>
                {lead.city}, {lead.state}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Google Places Enrichment Panel */}
      {!isNew && (
        <div className={styles.enrichPanel}>
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-body-sm)' }}>
              Enrich with Google Places
            </div>
            {isEnrichmentAvailable() ? (
              <p className={styles.enrichLabel}>Fetch phone, website, and address from Google.</p>
            ) : (
              <p className={styles.enrichLabel}>
                API key not configured — will use mock data. Set <code>VITE_GOOGLE_PLACES_KEY</code> for live enrichment.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {enrichResult && (
              <div className={styles.enrichResult}>
                Enriched: {[enrichResult.phone, enrichResult.website].filter(Boolean).join(', ')}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnrich}
              loading={enriching}
              disabled={enriching}
            >
              {enriching ? 'Enriching…' : 'Enrich Lead'}
            </Button>
          </div>
        </div>
      )}

      <Card variant="bordered" padding="lg">
        <LeadForm
          lead={lead}
          onSave={handleSave}
          onCancel={() => navigate('/crm/leads')}
          saving={saving}
          saveError={saveError}
        />
      </Card>
    </div>
  )
}
