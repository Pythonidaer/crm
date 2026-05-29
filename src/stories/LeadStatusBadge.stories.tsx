import type { Meta, StoryObj } from '@storybook/react-vite'
import { LeadStatusBadge } from '../components/LeadStatusBadge'

const meta = {
  title: 'CRM/LeadStatusBadge',
  component: LeadStatusBadge,
  tags: ['autodocs'],
} satisfies Meta<typeof LeadStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const NotContacted: Story = { args: { status: 'not_contacted' } }
export const Called: Story = { args: { status: 'called' } }
export const Interested: Story = { args: { status: 'interested' } }
export const FollowUp: Story = { args: { status: 'follow_up' } }
export const ProposalSent: Story = { args: { status: 'proposal_sent' } }
export const Won: Story = { args: { status: 'won' } }
export const Lost: Story = { args: { status: 'lost' } }

export const AllStatuses = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {(['not_contacted', 'called', 'interested', 'follow_up', 'proposal_sent', 'won', 'lost'] as const).map(
        (s) => <LeadStatusBadge key={s} status={s} />,
      )}
    </div>
  ),
} satisfies Partial<Story>
