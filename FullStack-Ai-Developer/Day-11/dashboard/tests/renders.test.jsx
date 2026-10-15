// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup,render,  screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Instant fake network, so the test is fast and never hits the 30% random failure.
vi.mock('../src/lib/mockApi', () => ({
  fetchStats: async ({ range }) => [{ label: 'Open tasks', value: range === '30d' ? 15 : 12 }],
  fetchActivity: async () => [{ id: 1, text: 'Deployed v1.4', time: '2h ago' }],
}))
vi.mock('../src/lib/mockChatApi', () => ({
  streamReply: async function* () {
    for (const token of ['one ', 'two ', 'three ', 'four ']) {
      await new Promise((resolve) => setTimeout(resolve, 5))
      yield token
    }
  },
}))

import App from '../src/App'
import { renderCounts } from '../src/lib/renderCounts'
import { useDashboardStore } from '../src/store/dashboardStore'

const snapshot = () => ({ ...renderCounts })

async function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  )
  await screen.findByText('12') // stats loaded
  await screen.findByText('Deployed v1.4') // activity loaded
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn() // jsdom doesn't implement it
  localStorage.clear()
  useDashboardStore.setState({ range: '7d' })
  for (const key of Object.keys(renderCounts)) delete renderCounts[key]
})
afterEach(cleanup)

describe('render isolation', () => {
  it('changing the range re-renders only the parts that show it', async () => {
    const user = userEvent.setup()
    await setup()
    const before = snapshot()

    await user.click(screen.getByRole('button', { name: '30d' }))
    await screen.findByText('15')
    const after = snapshot()

    expect(after.RangeSwitcher).toBeGreaterThan(before.RangeSwitcher)
    expect(after.StatsGrid).toBeGreaterThan(before.StatsGrid)
    expect(after.Sidebar).toBe(before.Sidebar)
    expect(after.ScheduleCard).toBe(before.ScheduleCard)
  })

  it('adding a busy hour re-renders only the schedule card', async () => {
    const user = userEvent.setup()
    await setup()
    const before = snapshot()

    await user.type(screen.getByPlaceholderText('Start (0-24)'), '21')
    await user.type(screen.getByPlaceholderText('End (0-24)'), '22')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('21:00 – 22:00')
    const after = snapshot()

    expect(after.ScheduleCard).toBeGreaterThan(before.ScheduleCard)
    for (const name of ['Sidebar', 'RangeSwitcher', 'RefreshButton', 'StatsGrid', 'ActivityCard']) {
      expect(after[name], name).toBe(before[name])
    }
  })

  it('streaming a chat reply does not re-render the sidebar or topbar controls', async () => {
    const user = userEvent.setup()
    await setup()
    await user.click(screen.getByRole('button', { name: 'Assistant' }))
    const input = await screen.findByPlaceholderText('Ask something…')
    const before = snapshot()

    await user.type(input, 'hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    await screen.findByText(/one two three four/)
    const after = snapshot()

    for (const name of ['Sidebar', 'RangeSwitcher', 'RefreshButton']) {
      expect(after[name], name).toBe(before[name])
    }
  })
})