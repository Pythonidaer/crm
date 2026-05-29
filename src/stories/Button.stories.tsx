import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@pythonidaer/ui'

const meta = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Button' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Danger: Story = { args: { variant: 'danger' } }
export const Loading: Story = { args: { variant: 'primary', loading: true } }
export const Small: Story = { args: { variant: 'primary', size: 'sm' } }
export const Large: Story = { args: { variant: 'primary', size: 'lg' } }
