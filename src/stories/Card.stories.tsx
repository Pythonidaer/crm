import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, Text } from '@pythonidaer/ui'

const meta = {
  title: 'Design System/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    children: (
      <div>
        <Text variant="h5">Card Title</Text>
        <Text>Some content inside the card.</Text>
      </div>
    ),
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { variant: 'default', padding: 'md' } }
export const Elevated: Story = { args: { variant: 'elevated', padding: 'md' } }
export const Bordered: Story = { args: { variant: 'bordered', padding: 'md' } }
export const Hoverable: Story = { args: { variant: 'bordered', padding: 'md', hoverable: true } }
