import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { DemoPage } from '../pages/DemoPage'

const meta = {
  title: 'CRM/DemoPage',
  component: DemoPage,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/demo']}>
        <Routes>
          <Route path="/demo" element={<Story />} />
          <Route path="/login" element={<div style={{ padding: '40px' }}>Login page</div>} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DemoPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
