import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Button, FormField, Input } from '@pythonidaer/ui'
import { login } from '../../utils/authStorage'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (login(password)) {
      navigate('/crm/leads')
    } else {
      setError('Incorrect password. Try again.')
      setPassword('')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Card variant="elevated" padding="lg">
          <div className={styles.header}>
            <div className={styles.logo}>Jonnovative</div>
            <div className={styles.sub}>Sign in to your CRM</div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} aria-label="Login form">
            {error && <div className={styles.error} role="alert">{error}</div>}

            <FormField label="Password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                autoComplete="current-password"
                required
              />
            </FormField>

            <Button type="submit" variant="primary" style={{ width: '100%' }}>
              Sign In
            </Button>
          </form>

          <p className={styles.demoLink}>
            <Link to="/demo">View public demo →</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
