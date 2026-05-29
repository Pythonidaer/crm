import { describe, it, expect } from 'vitest'
import { isAuthenticated, login, logout, setStoredPassword, getStoredPassword, DEFAULT_PASSWORD } from '../authStorage'

describe('authStorage', () => {
  it('is not authenticated by default', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('authenticates with the default password', () => {
    expect(login(DEFAULT_PASSWORD)).toBe(true)
    expect(isAuthenticated()).toBe(true)
  })

  it('rejects wrong password', () => {
    expect(login('wrong')).toBe(false)
    expect(isAuthenticated()).toBe(false)
  })

  it('logout clears auth flag', () => {
    login(DEFAULT_PASSWORD)
    logout()
    expect(isAuthenticated()).toBe(false)
  })

  it('setStoredPassword updates the password', () => {
    setStoredPassword('mynewpassword')
    expect(getStoredPassword()).toBe('mynewpassword')
    expect(login('mynewpassword')).toBe(true)
  })
})
