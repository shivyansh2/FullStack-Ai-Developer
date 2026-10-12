export default function Sidebar({ items, active, onSelect }) {
  return (
    <nav className="sidebar">
      <strong>Day 8</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <button className={item === active ? 'nav active' : 'nav'} onClick={() => onSelect(item)}>
              {item}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}