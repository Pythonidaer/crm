import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LeadForm } from '../LeadForm'
import { applyDefaults } from '../../utils/leadValidation'

function renderForm(onSave = vi.fn()) {
  const lead = applyDefaults({ companyName: 'Test Corp', city: 'Salem', state: 'MA' })
  render(
    <MemoryRouter>
      <LeadForm lead={lead} onSave={onSave} />
    </MemoryRouter>,
  )
  return lead
}

describe('LeadForm', () => {
  it('renders company name field with initial value', () => {
    renderForm()
    expect(screen.getByDisplayValue('Test Corp')).toBeInTheDocument()
  })

  it('renders city field', () => {
    renderForm()
    expect(screen.getByDisplayValue('Salem')).toBeInTheDocument()
  })

  it('calls onSave when form is submitted', () => {
    const onSave = vi.fn()
    renderForm(onSave)
    fireEvent.submit(screen.getByRole('form', { name: /edit lead/i }))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('updates company name when user types', () => {
    const onSave = vi.fn()
    renderForm(onSave)
    const input = screen.getByDisplayValue('Test Corp')
    fireEvent.change(input, { target: { value: 'New Name' } })
    fireEvent.submit(screen.getByRole('form', { name: /edit lead/i }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ companyName: 'New Name' }),
    )
  })

  it('renders all qualification checkboxes', () => {
    renderForm()
    expect(screen.getByLabelText('Has Website')).toBeInTheDocument()
    expect(screen.getByLabelText('SEO Opportunity')).toBeInTheDocument()
    expect(screen.getByLabelText('Accessibility Opportunity')).toBeInTheDocument()
  })
})
