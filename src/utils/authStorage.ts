/**
 * Simple localStorage-based auth.
 * NOT production-grade security — the password is stored in plaintext
 * in localStorage. This is intentional for a local-only tool.
 * Do not use this pattern in a multi-user or networked application.
 */

const AUTH_KEY = 'jonnovative_crm_auth'
const PASSWORD_KEY = 'jonnovative_crm_password'

/** The default password — change this before first use. */
export const DEFAULT_PASSWORD = 'jonnovative2024'

export function getStoredPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) ?? DEFAULT_PASSWORD
}

export function setStoredPassword(password: string): void {
  localStorage.setItem(PASSWORD_KEY, password)
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true'
}

export function login(password: string): boolean {
  if (password === getStoredPassword()) {
    localStorage.setItem(AUTH_KEY, 'true')
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}
