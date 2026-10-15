import Renders from './Renders'
import { memo } from 'react'

 function Sidebar({ items, active, onSelect }) {
  return (
    <nav className="sidebar">
      <strong>Day 11</strong>
      <Renders name="Sidebar" />
      <ul>
        {items.map((item) => (
          <li key={item}>
            <button
              className={item === active ? 'nav active' : 'nav'}
              onClick={() => onSelect(item)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
export default memo(Sidebar)