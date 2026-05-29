import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@pythonidaer/ui'
import { EmptyState } from '../components/EmptyState'

const meta = {
  title: 'CRM/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const NoLeads: Story = {
  args: {
    icon: '📋',
    heading: 'No leads yet',
    description: 'Add your first lead or import data from DER.',
    children: <Button variant="primary">Add Lead</Button>,
  },
}

export const NoResults: Story = {
  args: {
    icon: '🔍',
    heading: 'No leads match your filters',
    description: 'Try adjusting your search or clearing filters.',
    children: <Button variant="outline">Clear Filters</Button>,
  },
}

export const NoContent: Story = {
  args: {
    heading: 'Nothing here',
  },
}
