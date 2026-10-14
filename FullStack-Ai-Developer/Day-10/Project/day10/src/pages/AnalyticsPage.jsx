import { useState } from 'react'
import { useTasks } from '../context/TasksContext'

export default function AnalyticsPage() {
  const tasks = useTasks()
  const [boom, setBoom] = useState(false)
  if (boom) throw new Error('Analytics crashed on purpose')

  const done = tasks.filter((t) => t.done).length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  return (
    <section className="card">
      <h3>Analytics</h3>
      <p className="muted">{pct}% complete</p>
      <div className="bar">
        <div className="fill" style={{ width: `${pct}%` }} />
      </div>
      <p>{done} done · {tasks.length - done} open</p>
      <button onClick={() => setBoom(true)}>Crash this page</button>
    </section>
  )
}