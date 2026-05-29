import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'

const meta = {
  title: 'CRM/LoginPage',
  component: LoginPage,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Story />} />
          <Route path="/crm/leads" element={<div style={{ padding: '40px' }}>✓ Logged in — CRM Dashboard</div>} />
          <Route path="/demo" element={<div style={{ padding: '40px' }}>Demo page</div>} />
        </Routes>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof LoginPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
