import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { LeadTable } from '../components/LeadTable'
import { MOCK_LEADS } from '../utils/mockLeadData'
import type { LeadSortKey } from '../types/lead'

const meta = {
  title: 'CRM/LeadTable',
  component: LeadTable,
  tags: ['autodocs'],
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
} satisfies Meta<typeof LeadTable>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveTable() {
  const [sortKey, setSortKey] = useState<LeadSortKey>('companyName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(key: LeadSortKey) {
    if (key === sortKey) setSortDir((d: 'asc' | 'desc') => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <LeadTable
      leads={MOCK_LEADS}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={handleSort}
    />
  )
}

export const Default = {
  render: () => <InteractiveTable />,
} satisfies Partial<Story>

export const ReadOnly: Story = {
  args: {
    leads: MOCK_LEADS,
    sortKey: 'companyName',
    sortDir: 'asc',
    onSort: () => {},
    readOnly: true,
  },
}
