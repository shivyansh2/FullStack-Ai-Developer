import { useState } from 'react'
import Sidebar from './components/Sidebar'
import RangeSwitcher from './components/RangeSwitcher'
import RefreshButton from './components/RefreshButton'
import StatsGrid from './components/StatsGrid'
import ActivityCard from './components/ActivityCard'
import ScheduleCard from './components/ScheduleCard'
import ChatPanel from './components/ChatPanel'
import { useChat } from './hooks/useChat'

const NAV = ['Overview', 'Assistant']

export default function App() {
  const [view, setView] = useState('Overview')
  const chat = useChat()

  return (
    <div className="shell">
      <Sidebar items={NAV} active={view} onSelect={setView} />
      <div className="main">
        <header className="topbar">
          <h2>{view}</h2>
          <div className="row">
            <RangeSwitcher />
            <RefreshButton />
          </div>
        </header>
        <main className="content">
          {view === 'Overview' ? (
            <>
              <StatsGrid />
              <ActivityCard />
              <ScheduleCard />
            </>
          ) : (
            <ChatPanel {...chat} />
          )}
        </main>
      </div>
    </div>
  )
}