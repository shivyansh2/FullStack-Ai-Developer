const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')) },
      { once: true }
    )
  })

const STATS = {
  '24h': [
    { label: 'Open tasks', value: 12 },
    { label: 'Deploys', value: 1 },
    { label: 'Uptime', value: '100%' },
  ],
  '7d': [
    { label: 'Open tasks', value: 12 },
    { label: 'Deploys', value: 4 },
    { label: 'Uptime', value: '99.9%' },
  ],
  '30d': [
    { label: 'Open tasks', value: 15 },
    { label: 'Deploys', value: 17 },
    { label: 'Uptime', value: '99.7%' },
  ],
}

const ACTIVITY = {
  '24h': [], // empty on purpose, so you can see the empty state
  '7d': [
    { id: 1, text: 'Deployed v1.4', time: '2h ago' },
    { id: 2, text: 'Merged PR #38', time: '5h ago' },
    { id: 3, text: 'Closed 3 issues', time: 'yesterday' },
  ],
  '30d': [
    { id: 1, text: 'Deployed v1.4', time: '2h ago' },
    { id: 2, text: 'Merged PR #38', time: '5h ago' },
    { id: 3, text: 'Closed 3 issues', time: 'yesterday' },
    { id: 4, text: 'Released v1.3', time: '9 days ago' },
    { id: 5, text: 'Migrated to Postgres', time: '3 weeks ago' },
  ],
}

export async function fetchStats({ range, signal }) {
  console.log('[api] GET /stats', range) // watch this to see when the cache is used
  await sleep(800, signal)
  if (Math.random() < 0.3) throw new Error('Failed to load stats (500)')
  return STATS[range]
}

export async function fetchActivity({ range, signal }) {
  console.log('[api] GET /activity', range)
  await sleep(1200, signal)
  return ACTIVITY[range]
}