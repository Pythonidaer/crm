import styles from './EmptyState.module.css'

interface EmptyStateProps {
  icon?: string
  heading: string
  description?: string
  children?: React.ReactNode
}

export function EmptyState({ icon = '📋', heading, description, children }: EmptyStateProps) {
  return (
    <div className={styles.wrapper} data-testid="empty-state">
      <div className={styles.icon} aria-hidden="true">{icon}</div>
      <h2 className={styles.heading}>{heading}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  )
}
