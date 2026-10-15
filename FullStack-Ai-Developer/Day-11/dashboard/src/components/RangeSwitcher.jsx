import { RANGES, useDashboardStore } from '../store/dashboardStore'
import Renders from './Renders'
import { memo } from 'react'

 function RangeSwitcher() {
  const range = useDashboardStore((s) => s.range)
  const setRange = useDashboardStore((s) => s.setRange)

  return (
    <div className="row" role="group" aria-label="Time range">
      {RANGES.map((r) => (
        <button
          key={r}
          className={r === range ? 'chip active' : 'chip'}
          aria-pressed={r === range}
          onClick={() => setRange(r)}
        >
          {r}
        </button>
      ))}
      <Renders name="RangeSwitcher" />
    </div>
  )
}
export default memo(RangeSwitcher)