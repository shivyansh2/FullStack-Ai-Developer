import { useState } from 'react'

const INITIAL = [
  { id: 'a', name: 'Alice' },
  { id: 'b', name: 'Bob' },
  { id: 'c', name: 'Cara' },
]

function Column({ title, items, getKey }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <ul className="list">
        {items.map((item, index) => (
          <li key={getKey(item, index)}>
            <span>{item.name}</span>
            <input placeholder="type here…" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function KeysLab() {
  const [items, setItems] = useState(INITIAL)

  return (
    <>
      <p className="muted">Type something in every input, then click Reverse.</p>
      <div>
        <button onClick={() => setItems((prev) => [...prev].reverse())}>Reverse</button>
      </div>
      <div className="two">
        <Column title="key = index (wrong)" items={items} getKey={(_, i) => i} />
        <Column title="key = id (right)" items={items} getKey={(item) => item.id} />
      </div>
    </>
  )
}