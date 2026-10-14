import { lazy, Suspense, useState } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { TasksProvider } from './context/TasksContext'
import ErrorBoundary from './components/ErrorBoundary'
import TasksPage from './pages/TasksPage'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// lazy() must be called at module level, never inside a component
const AnalyticsPage = lazy(() => delay(1000).then(() => import('./pages/AnalyticsPage')))
const KeysLab = lazy(() => delay(600).then(() => import('./pages/KeysLab')))

const PAGES = { Tasks: TasksPage, Analytics: AnalyticsPage, 'Keys lab': KeysLab }

function Shell() {
  const [view, setView] = useState('Tasks')
  const { theme, toggle } = useTheme()
  const Page = PAGES[view]

  return (
    <div className="shell" data-theme={theme}>
      <nav className="sidebar">
        <strong>Day 10</strong>
        <ul>
          {Object.keys(PAGES).map((name) => (
            <li key={name}>
              <button className={name === view ? 'nav active' : 'nav'} onClick={() => setView(name)}>
                {name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="main">
        <header className="topbar">
          <h2>{view}</h2>
          <button onClick={toggle}>Theme: {theme}</button>
        </header>
        <main className="content">
          <ErrorBoundary resetKey={view}>
            <Suspense fallback={<p className="muted">Loading page…</p>}>
              <Page />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <TasksProvider>
        <Shell />
      </TasksProvider>
    </ThemeProvider>
  )
}