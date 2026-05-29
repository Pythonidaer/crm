import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScriptsPage } from '../pages/ScriptsPage'

const meta = {
  title: 'CRM/ScriptsPage',
  component: ScriptsPage,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ScriptsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
