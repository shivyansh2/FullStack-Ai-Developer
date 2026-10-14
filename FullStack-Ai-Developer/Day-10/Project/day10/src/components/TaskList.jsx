import { useRef } from 'react'
import { useTasks, useTasksDispatch } from '../context/TasksContext'
import TaskItem from './TaskItem'

export default function TaskList() {
  const tasks = useTasks()
  const dispatch = useTasksDispatch()
  const endRef = useRef(null)
  const doneCount = tasks.filter((t) => t.done).length

  return (
    <section className="card">
      <div className="row space">
        <h3>Tasks ({doneCount}/{tasks.length} done)</h3>
        <div className="row">
          <button onClick={() => endRef.current.scrollIntoView({ behavior: 'smooth' })}>Jump to bottom</button>
          <button onClick={() => dispatch({ type: 'cleared' })}>Clear done</button>
        </div>
      </div>
      <p className="muted small">Double-click a task to edit it.</p>
      <ul className="list tasks">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        <li ref={endRef} aria-hidden="true" />
      </ul>
    </section>
  )
}