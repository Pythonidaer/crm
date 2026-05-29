import { useState } from 'react'
import { Button, Card, Text, FormField, TextArea } from '@pythonidaer/ui'
import { getLeads, saveLeads } from '../../utils/leadStorage'
import { importLeads } from '../../utils/leadImportExport'
import styles from './ImportLeadsPage.module.css'

export function ImportLeadsPage() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [committed, setCommitted] = useState(false)

  function handlePreview() {
    const existing = getLeads()
    const { imported, skipped, errors } = importLeads(json, existing)
    setResult({ imported: imported.length, skipped, errors })
    setCommitted(false)
  }

  function handleCommit() {
    const existing = getLeads()
    const { imported } = importLeads(json, existing)
    saveLeads([...existing, ...imported])
    setCommitted(true)
    setJson('')
    setResult((prev) => (prev ? { ...prev } : null))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Text as="h1" variant="h3">Import Leads</Text>
        <p className={styles.subtitle}>
          Paste a JSON array of leads exported from DER data or a previous backup.
          Duplicates (by company name + city + address) are automatically skipped.
        </p>
      </div>

      <Card variant="bordered" padding="lg">
        <div className={styles.form}>
          <FormField
            label="JSON Leads Array"
            htmlFor="json-input"
            hint='Paste an array like: [{ "companyName": "Acme", "city": "Salem", ... }]'
          >
            <TextArea
              id="json-input"
              value={json}
              onChange={(e) => { setJson(e.target.value); setResult(null); setCommitted(false) }}
              rows={12}
              placeholder='[
  {
    "companyName": "Example Co",
    "city": "Salem",
    "state": "MA",
    "sector": "Manufacturing",
    "selector": "Food Manufacturing"
  }
]'
              style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-body-sm)' }}
            />
          </FormField>

          <div className={styles.actions}>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!json.trim()}
            >
              Validate & Preview
            </Button>
            {result && !committed && result.imported > 0 && (
              <Button variant="primary" onClick={handleCommit}>
                Import {result.imported} Lead{result.imported !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <Card variant="bordered" padding="md">
          <div className={styles.resultHeader}>
            {committed ? (
              <p className={styles.success}>
                ✓ Successfully imported {result.imported} lead{result.imported !== 1 ? 's' : ''}.
              </p>
            ) : (
              <p className={styles.preview}>
                Preview: <strong>{result.imported}</strong> to import, <strong>{result.skipped}</strong> skipped
              </p>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className={styles.errors}>
              <p className={styles.errorsTitle}>Validation issues:</p>
              <ul>
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card variant="default" padding="md">
        <h3 style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 var(--space-3)' }}>
          Required fields
        </h3>
        <ul style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)', margin: 0, paddingLeft: 'var(--space-5)' }}>
          <li><code>companyName</code> (string)</li>
          <li><code>city</code> (string)</li>
        </ul>
        <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)', marginBottom: 0 }}>
          All other fields are optional and will receive safe defaults. See the README for the full data model.
        </p>
      </Card>
    </div>
  )
}
