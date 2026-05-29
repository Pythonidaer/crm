import { useState } from 'react'
import { Button, Card, Text } from '@pythonidaer/ui'
import { getLeads } from '../../utils/leadStorage'
import { exportLeadsToJson, downloadLeadsJson } from '../../utils/leadImportExport'
import styles from './ExportLeadsPage.module.css'

export function ExportLeadsPage() {
  const leads = getLeads()
  const json = exportLeadsToJson(leads)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownload() {
    downloadLeadsJson(leads)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Text as="h1" variant="h3">Export Leads</Text>
        <p className={styles.subtitle}>
          Download all your leads as a JSON file or copy to clipboard. Use this as a backup or to import into another tool.
        </p>
      </div>

      <Card variant="bordered" padding="md">
        <div className={styles.stats}>
          <div>
            <span className={styles.statValue}>{leads.length}</span>
            <span className={styles.statLabel}> lead{leads.length !== 1 ? 's' : ''} stored</span>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" onClick={handleCopy} disabled={leads.length === 0}>
              {copied ? 'Copied!' : 'Copy JSON'}
            </Button>
            <Button variant="primary" onClick={handleDownload} disabled={leads.length === 0}>
              Download .json
            </Button>
          </div>
        </div>
      </Card>

      {leads.length > 0 && (
        <Card variant="default" padding="md">
          <pre className={styles.preview}>{json}</pre>
        </Card>
      )}

      {leads.length === 0 && (
        <Card variant="default" padding="lg">
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', margin: 0 }}>
            No leads to export yet. Add some leads first.
          </p>
        </Card>
      )}
    </div>
  )
}
