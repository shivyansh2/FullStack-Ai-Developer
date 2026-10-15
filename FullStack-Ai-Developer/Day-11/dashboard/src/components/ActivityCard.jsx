import QueryBoundary from './QueryBoundary'
import { useActivityQuery } from '../hooks/useDashboardQueries'

export default function ActivityCard() {
  const query = useActivityQuery()

  return (
    <section className="card">
      <h3>Recent activity</h3>
      <QueryBoundary name="ActivityCard" query={query} isEmpty={(d) => d.length === 0} empty="No activity in this range.">
        {(items) => (
          <ul className="list">
            {items.map((a) => (
              <li key={a.id}>
                <span>{a.text}</span>
                <span className="muted">{a.time}</span>
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>
    </section>
  )
}