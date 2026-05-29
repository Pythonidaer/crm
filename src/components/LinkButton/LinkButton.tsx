import { Link } from 'react-router-dom'
import type { ButtonVariant, ButtonSize } from '@pythonidaer/ui'
import styles from './LinkButton.module.css'

interface LinkButtonProps {
  to: string
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

/**
 * A React Router Link styled to look like a Button.
 * Use this anywhere you need a navigation action that looks like a button,
 * since @pythonidaer/ui Button does not support the `as` prop.
 */
export function LinkButton({ to, variant = 'primary', size = 'md', children, style, className }: LinkButtonProps) {
  return (
    <Link
      to={to}
      className={`${styles.base} ${styles[variant]} ${styles[`size_${size}`]} ${className ?? ''}`}
      style={style}
    >
      {children}
    </Link>
  )
}
