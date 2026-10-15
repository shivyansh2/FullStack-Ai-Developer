import { useEffect, useRef } from 'react'
import { renderCounts } from '../lib/renderCounts'

export default function Renders({ name }) {
  const count = useRef(0)

  useEffect(() => {
    count.current += 1
    renderCounts[name] = count.current
  })

  return (
    <span className="muted small">
      renders: {renderCounts[name] ?? 0}
    </span>
  )
}