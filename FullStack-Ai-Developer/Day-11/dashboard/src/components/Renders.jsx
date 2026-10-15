import { useRef } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const renderCounts = {}

export default function Renders({ name }) {
  const count = useRef(0)
  /* eslint-disable react-hooks/refs */
  count.current += 1
  renderCounts[name] = count.current
  /* eslint-enable react-hooks/refs */
  return <span className="muted small"> renders: {count.current}</span>
}