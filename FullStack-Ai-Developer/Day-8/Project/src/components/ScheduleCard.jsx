import { useState } from 'react'
import { insertInterval, mergeIntervals } from '../lib/intervals'

const SEED = [[9, 11], [10, 12], [14, 15], [18, 20]]
const fmt = (h) => `${String(h).padStart(2, '0')}:00`

export default function ScheduleCard() {
  const [blocks, setBlocks] = useState(() => mergeIntervals(SEED))
  const [form, setForm] = useState({ start: '', end: '' })
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    const start = Number(form.start)
    const end = Number(form.end)
    if (form.start === '' || form.end === '' || start < 0 || end > 24 || start >= end) {
      setError('Enter hours between 0 and 24, with start before end.')
      return
    }
    setError('')
    setBlocks((prev) => insertInterval(prev, [start, end]))
    setForm({ start: '', end: '' })
  }

  const remove = (s, e) => setBlocks((prev) => prev.filter(([x, y]) => !(x === s && y === e)))

  return (
    <section className="card">
      <h3>Busy hours</h3>
      <ul className="list">
        {blocks.map(([s, e]) => (
          <li key={`${s}-${e}`}>
            <span>{fmt(s)} – {fmt(e)}</span>
            <button onClick={() => remove(s, e)} aria-label={`Remove ${fmt(s)} to ${fmt(e)}`}>✕</button>
          </li>
        ))}
        {blocks.length === 0 && <li className="muted">No busy blocks.</li>}
      </ul>
      <form className="row" onSubmit={onSubmit}>
        <input name="start" type="number" placeholder="Start (0-24)" value={form.start} onChange={onChange} />
        <input name="end" type="number" placeholder="End (0-24)" value={form.end} onChange={onChange} />
        <button type="submit">Add</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}