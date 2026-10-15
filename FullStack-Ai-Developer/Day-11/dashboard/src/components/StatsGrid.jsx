import QueryBoundary from './QueryBoundary'
import StatCard from './StatCard'
import { useStatsQuery } from '../hooks/useDashboardQueries'

export default function StatsGrid() {
  const query = useStatsQuery()

  return (
    <QueryBoundary name="StatsGrid" query={query} isEmpty={(d) => d.length === 0} empty="No stats for this range.">
      {(stats) => (
        <div className="stats">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}
    </QueryBoundary>
  )
}