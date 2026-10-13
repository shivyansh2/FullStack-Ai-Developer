
import './App.css'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">Flow<span>.</span></h2>

        <p className="menu-label">WORKSPACE</p>
        <nav>
          <button className="nav-item active">Overview</button>
          <button className="nav-item">My Tasks</button>
          <button className="nav-item">Activity</button>
        </nav>

        <div className="sidebar-bottom">
          <p>DAY 09 / REACT HOOKS</p>
          <span>Learning in progress</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>Dashboard</h1>
          </div>

          <div className="profile">
            <div className="avatar">S</div>
            <div>
              <strong>Developer</strong>
              <p>Full Stack + AI</p>
            </div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">MONDAY · YOUR DAILY OVERVIEW</p>
            <h2>Build something great.</h2>
            <p>Small steps today. Better applications tomorrow.</p>
          </div>
          <div className="welcome-icon">✦</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <p>Total tasks</p>
            <h2>12</h2>
            <span>Across your workspace</span>
          </article>

          <article className="stat-card">
            <p>Completed</p>
            <h2>08</h2>
            <span>Tasks finished</span>
          </article>

          <article className="stat-card">
            <p>In progress</p>
            <h2>04</h2>
            <span>Keep it moving</span>
          </article>
        </section>

        <section className="content-panel">
          <div>
            <h2>Today's focus</h2>
            <p>Build the foundation before adding functionality.</p>
          </div>
          <div className="focus-badge">STEP 02</div>
        </section>
      </main>
    </div>
  )
}

export default App
