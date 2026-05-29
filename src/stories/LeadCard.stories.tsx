import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { LeadCard } from '../components/LeadCard'
import { MOCK_LEADS } from '../utils/mockLeadData'

const meta = {
  title: 'CRM/LeadCard',
  component: LeadCard,
  tags: ['autodocs'],
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
} satisfies Meta<typeof LeadCard>

export default meta
type Story = StoryObj<typeof meta>

export const NotContacted: Story = { args: { lead: MOCK_LEADS[0] } }
export const Called: Story = { args: { lead: MOCK_LEADS[1] } }
export const Interested: Story = { args: { lead: MOCK_LEADS[3] } }
export const ProposalSent: Story = { args: { lead: MOCK_LEADS[7] } }
export const ReadOnly: Story = { args: { lead: MOCK_LEADS[2], readOnly: true } }
