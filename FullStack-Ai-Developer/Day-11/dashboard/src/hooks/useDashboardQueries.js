import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDashboardStore } from '../store/dashboardStore'
import { fetchActivity, fetchStats } from '../lib/mockApi'

// Hierarchical keys: invalidating ['dashboard'] refreshes everything below it.
export const dashboardKeys = {
  all: ['dashboard'],
  stats: (range) => ['dashboard', 'stats', { range }],
  activity: (range) => ['dashboard', 'activity', { range }],
}

export function useStatsQuery() {
  const range = useDashboardStore((s) => s.range)
  return useQuery({
    queryKey: dashboardKeys.stats(range),
    queryFn: ({ signal }) => fetchStats({ range, signal }),
    staleTime: 30_000, // changes slowly: reuse for 30s without refetching
    retry: false, // demo only, so you can see the error state; use 1-3 in real apps
    placeholderData: keepPreviousData, // keep showing the old range while the new one loads
  })
}

export function useActivityQuery() {
  const range = useDashboardStore((s) => s.range)
  return useQuery({
    queryKey: dashboardKeys.activity(range),
    queryFn: ({ signal }) => fetchActivity({ range, signal }),
    staleTime: 10_000, // more volatile: reuse for only 10s
    placeholderData: keepPreviousData,
  })
}