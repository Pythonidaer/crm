import { useState } from 'react'
import {
  Button,
  FormField,
  Input,
  Select,
  TextArea,
  Checkbox,
} from '@pythonidaer/ui'
import type { Lead } from '../../types/lead'
import { fromDateInputValue, toDateInputValue } from '../../utils/dateInput'
import styles from './LeadForm.module.css'

const STATUS_OPTIONS = [
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'called', label: 'Called' },
  { value: 'interested', label: 'Interested' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

interface LeadFormProps {
  lead: Lead
  onSave: (lead: Lead) => void | Promise<void>
  onCancel?: () => void
  saving?: boolean
  saveError?: string | null
}

export function LeadForm({ lead, onSave, onCancel, saving = false, saveError = null }: LeadFormProps) {
  const [draft, setDraft] = useState<Lead>(lead)

  function set<K extends keyof Lead>(key: K, value: Lead[K]) {
    setDraft((prev) => ({ ...prev, [key]: value, updatedAt: new Date().toISOString() }))
  }

  function setQual(key: keyof Lead['qualification'], value: boolean) {
    setDraft((prev) => ({
      ...prev,
      qualification: { ...prev.qualification, [key]: value },
    }))
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => { e.preventDefault(); onSave(draft) }}
      aria-label="Edit lead"
    >
      {/* Company Info */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Company Info</h3>
        <div className={styles.grid}>
          <FormField label="Company Name" htmlFor="companyName" required>
            <Input
              id="companyName"
              value={draft.companyName}
              onChange={(e) => set('companyName', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Address" htmlFor="address">
            <Input
              id="address"
              value={draft.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </FormField>
          <FormField label="City" htmlFor="city" required>
            <Input
              id="city"
              value={draft.city}
              onChange={(e) => set('city', e.target.value)}
              required
            />
          </FormField>
          <FormField label="State" htmlFor="state">
            <Input
              id="state"
              value={draft.state}
              onChange={(e) => set('state', e.target.value)}
            />
          </FormField>
          <FormField label="Sector" htmlFor="sector">
            <Input
              id="sector"
              value={draft.sector}
              onChange={(e) => set('sector', e.target.value)}
            />
          </FormField>
          <FormField label="Phone" htmlFor="phoneNumber">
            <Input
              id="phoneNumber"
              type="tel"
              value={draft.phoneNumber ?? ''}
              onChange={(e) => set('phoneNumber', e.target.value || null)}
            />
          </FormField>
          <FormField label="Website" htmlFor="website">
            <Input
              id="website"
              type="url"
              value={draft.website ?? ''}
              onChange={(e) => set('website', e.target.value || null)}
            />
          </FormField>
        </div>
      </section>

      {/* Status & Priority */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Status & Priority</h3>
        <div className={styles.grid}>
          <FormField label="Status" htmlFor="status">
            <Select
              id="status"
              value={draft.status}
              onChange={(e) => set('status', e.target.value as Lead['status'])}
              options={STATUS_OPTIONS}
            />
          </FormField>
          <FormField label="Priority" htmlFor="priority">
            <Select
              id="priority"
              value={draft.priority}
              onChange={(e) => set('priority', e.target.value as Lead['priority'])}
              options={PRIORITY_OPTIONS}
            />
          </FormField>
          <FormField label="Next Follow Up" htmlFor="nextFollowUpAt">
            <Input
              id="nextFollowUpAt"
              type="date"
              value={toDateInputValue(draft.nextFollowUpAt)}
              onChange={(e) => set('nextFollowUpAt', fromDateInputValue(e.target.value))}
            />
          </FormField>
          <FormField label="Last Contacted" htmlFor="lastContactedAt">
            <Input
              id="lastContactedAt"
              type="date"
              value={toDateInputValue(draft.lastContactedAt)}
              onChange={(e) => set('lastContactedAt', fromDateInputValue(e.target.value))}
            />
          </FormField>
        </div>
      </section>

      {/* Contact */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Contact Person</h3>
        <div className={styles.grid}>
          <FormField label="Name" htmlFor="contactName">
            <Input
              id="contactName"
              value={draft.contactName}
              onChange={(e) => set('contactName', e.target.value)}
            />
          </FormField>
          <FormField label="Role" htmlFor="contactRole">
            <Input
              id="contactRole"
              value={draft.contactRole}
              onChange={(e) => set('contactRole', e.target.value)}
            />
          </FormField>
          <FormField label="Email" htmlFor="contactEmail">
            <Input
              id="contactEmail"
              type="email"
              value={draft.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
            />
          </FormField>
        </div>
      </section>

      {/* Qualification */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Qualification</h3>
        <div className={styles.qualGrid}>
          <Checkbox
            label="Has Website"
            checked={draft.qualification.hasWebsite}
            onChange={(e) => setQual('hasWebsite', e.target.checked)}
          />
          <Checkbox
            label="Website Needs Work"
            checked={draft.qualification.websiteNeedsWork}
            onChange={(e) => setQual('websiteNeedsWork', e.target.checked)}
          />
          <Checkbox
            label="Accessibility Opportunity"
            checked={draft.qualification.accessibilityOpportunity}
            onChange={(e) => setQual('accessibilityOpportunity', e.target.checked)}
          />
          <Checkbox
            label="SEO Opportunity"
            checked={draft.qualification.seoOpportunity}
            onChange={(e) => setQual('seoOpportunity', e.target.checked)}
          />
          <Checkbox
            label="AEO Opportunity"
            checked={draft.qualification.aeoOpportunity}
            onChange={(e) => setQual('aeoOpportunity', e.target.checked)}
          />
          <Checkbox
            label="Decision Maker Found"
            checked={draft.qualification.decisionMakerFound}
            onChange={(e) => setQual('decisionMakerFound', e.target.checked)}
          />
        </div>
      </section>

      {/* Notes */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Notes</h3>
        <FormField label="Notes" htmlFor="notes">
          <TextArea
            id="notes"
            value={draft.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={4}
            placeholder="Add notes about this lead…"
          />
        </FormField>
        <FormField label="Source URL" htmlFor="sourceUrl">
          <Input
            id="sourceUrl"
            type="url"
            value={draft.sourceUrl}
            onChange={(e) => set('sourceUrl', e.target.value)}
            placeholder="https://…"
          />
        </FormField>
      </section>

      <div className={styles.actions}>
        {saveError && (
          <p role="alert" style={{ color: 'var(--color-danger, #b42318)', marginRight: 'auto' }}>
            {saveError}
          </p>
        )}
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={saving} disabled={saving}>
          Save Lead
        </Button>
      </div>
    </form>
  )
}
