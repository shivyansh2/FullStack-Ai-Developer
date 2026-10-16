
import { useState } from 'react'
import './App.css'

type Task = {
  id: number
  title: string
  completed: boolean
}

const initialTasks: Task[] = [
  { id: 1, title: 'Plan today’s priorities', completed: true },
  { id: 2, title: 'Finish the React dashboard', completed: false },
  { id: 3, title: 'Write component tests', completed: false },
]

export function TaskStats({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter((task) => task.completed).length

  return (
    <section className="stats" aria-label="Task summary">
      <article className="stat-card">
        <span>Total tasks</span>
        <strong>{tasks.length}</strong>
      </article>
      <article className="stat-card">
        <span>Completed</span>
        <strong>{completed}</strong>
      </article>
      <article className="stat-card">
        <span>Pending</span>
        <strong>{tasks.length - completed}</strong>
      </article>
    </section>
  )
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const [title, setTitle] = useState('')
  const [page, setPage] = useState('Dashboard')

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setTasks((current) => [
      ...current,
      { id: Date.now(), title: trimmed, completed: false },
    ])
    setTitle('')
  }

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task,
      ),
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Solo Daily</h2>
        <nav aria-label="Main navigation">
          {['Dashboard', 'Tasks', 'Analytics', 'Settings'].map((item) => (
            <button
              key={item}
              className={page === item ? 'nav-item active' : 'nav-item'}
              onClick={() => setPage(item)}
              aria-current={page === item ? 'page' : undefined}
            >
              {item}
            </button>
          ))}
        </nav>
        <p className="sidebar-footer">One day at a time.</p>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>{page}</h1>
            <p>Make today count. One task at a time.</p>
          </div>
          <span className="avatar" aria-label="Your profile">S</span>
        </header>

        {page === 'Dashboard' || page === 'Tasks' ? (
          <>
            <TaskStats tasks={tasks} />

            <section className="task-panel" aria-labelledby="tasks-heading">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">YOUR CHECKLIST</p>
                  <h2 id="tasks-heading">
                    {page === 'Tasks' ? 'All tasks' : 'Today’s tasks'}
                  </h2>
                </div>
                <span className="task-count">
                  {tasks.filter((task) => !task.completed).length} left
                </span>
              </div>

              <form className="task-form" onSubmit={addTask}>
                <label className="sr-only" htmlFor="new-task">
                  New task
                </label>
                <input
                  id="new-task"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What do you need to do?"
                />
                <button type="submit">Add task</button>
              </form>

              {tasks.length === 0 ? (
                <p className="empty-state">No tasks yet. Add your first task!</p>
              ) : (
                <ul className="task-list">
                  {tasks.map((task) => (
                    <li key={task.id} className="task-row">
                      <label className={task.completed ? 'completed' : ''}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span>{task.title}</span>
                      </label>
                      <span className={task.completed ? 'status done' : 'status'}>
                        {task.completed ? 'Done' : 'Pending'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : (
          <section className="task-panel">
            <h2>{page}</h2>
            <p>
              {page === 'Analytics'
                ? 'Your task progress will appear here.'
                : 'Personalize your Solo Daily workspace here.'}
            </p>
          </section>
        )}
      </main>
    </div>
  )
}
