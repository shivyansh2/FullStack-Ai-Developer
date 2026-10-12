
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import ScheduleCard from './components/ScheduleCard'

const NAV = ['Overview', 'Assistant']

export default function App() {
  const [view, setView] = useState('Overview')

  return (
    <div className="shell">
      <Sidebar
        items={NAV}
        active={view}
        onSelect={setView}
      />

      <div className="main">
        <header className="topbar">
          <h2>{view}</h2>
        </header>

        <main className="content">
          <div className="stats">
            <StatCard label="Questions asked" value={0} />
            <StatCard label="Replies received" value={0} />
          </div>
        </main>
      </div>
    </div>
  )
}
