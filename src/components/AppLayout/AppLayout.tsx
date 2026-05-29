import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@pythonidaer/ui'
import { logout } from '../../utils/authStorage'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="Main navigation">
        <div className={styles.logo}>
          <div className={styles.logoText}>Jonnovative</div>
          <div className={styles.logoSub}>Leads CRM</div>
        </div>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>Main</div>
          <NavLink
            to="/crm/leads"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Leads
          </NavLink>
          <NavLink
            to="/crm/import"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Import Leads
          </NavLink>
          <NavLink
            to="/crm/export"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Export Leads
          </NavLink>

          <div className={styles.navLabel} style={{ marginTop: 'var(--space-4)' }}>Tools</div>
          <NavLink
            to="/crm/scripts"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Scripts
          </NavLink>
          <NavLink
            to="/crm/settings"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Settings
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <Button variant="ghost" size="sm" onClick={handleLogout} style={{ color: 'var(--color-neutral-400)', width: '100%' }}>
            Logout
          </Button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  )
}
