import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Text, FormField, Input } from '@pythonidaer/ui'
import { setStoredPassword, logout } from '../../utils/authStorage'
import { clearLeads, saveLeads, getLeads } from '../../utils/leadStorage'
import { MOCK_LEADS } from '../../utils/mockLeadData'
import { downloadLeadsJson } from '../../utils/leadImportExport'
import styles from './SettingsPage.module.css'

export function SettingsPage() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }
    setStoredPassword(newPassword)
    setNewPassword('')
    setConfirmPassword('')
    setPwError('')
    setPwSuccess('Password updated successfully.')
    setTimeout(() => setPwSuccess(''), 3000)
  }

  function handleClearData() {
    if (!confirm('This will permanently delete all leads. This cannot be undone. Are you sure?')) return
    clearLeads()
    navigate('/crm/leads')
  }

  function handleResetDemo() {
    if (!confirm('This will replace all leads with demo data. Are you sure?')) return
    saveLeads(MOCK_LEADS)
    navigate('/crm/leads')
  }

  function handleExportBackup() {
    downloadLeadsJson(getLeads())
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.page}>
      <Text as="h1" variant="h3" className={styles.title}>Settings</Text>

      {/* Change Password */}
      <Card variant="bordered" padding="lg">
        <h2 className={styles.sectionTitle}>Change Password</h2>
        <p className={styles.note}>
          This password is stored in plaintext in localStorage. It is only suitable for a personal,
          local-use tool — not a shared or networked environment.
        </p>
        <form className={styles.form} onSubmit={handlePasswordChange} aria-label="Change password">
          {pwError && <div className={styles.error} role="alert">{pwError}</div>}
          {pwSuccess && <div className={styles.success} role="status">{pwSuccess}</div>}
          <div className={styles.grid}>
            <FormField label="New Password" htmlFor="newPassword" required>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </FormField>
            <FormField label="Confirm Password" htmlFor="confirmPassword" required>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </FormField>
          </div>
          <Button type="submit" variant="primary" size="sm">Update Password</Button>
        </form>
        <p className={styles.hint}>Default password: <code>jonnovative2024</code></p>
      </Card>

      {/* Data Management */}
      <Card variant="bordered" padding="lg">
        <h2 className={styles.sectionTitle}>Data Management</h2>
        <div className={styles.actionRow}>
          <div>
            <strong>Export Backup</strong>
            <p className={styles.actionDesc}>Download all leads as a JSON file before making changes.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportBackup}>Export Backup</Button>
        </div>
        <div className={styles.actionRow}>
          <div>
            <strong>Reset to Demo Data</strong>
            <p className={styles.actionDesc}>Replace all leads with the built-in sample data. This overwrites your real data.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetDemo}>Reset Demo Data</Button>
        </div>
        <div className={styles.actionRow}>
          <div>
            <strong>Clear All Data</strong>
            <p className={styles.actionDesc}>Permanently delete all lead data from this browser. This cannot be undone.</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleClearData}>Clear All Leads</Button>
        </div>
      </Card>

      {/* Session */}
      <Card variant="bordered" padding="lg">
        <h2 className={styles.sectionTitle}>Session</h2>
        <div className={styles.actionRow}>
          <div>
            <strong>Sign Out</strong>
            <p className={styles.actionDesc}>Clear your authentication and return to the login screen.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Sign Out</Button>
        </div>
      </Card>
    </div>
  )
}
