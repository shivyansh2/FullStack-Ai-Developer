import { memo, useEffect, useRef, useState } from 'react'
import { useTasksDispatch } from '../context/TasksContext'

function TaskItem({ task }) {
  const dispatch = useTasksDispatch()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.text)
  const editRef = useRef(null)
  const renders = useRef(0)
  renders.current += 1 // demo only: counts how often this row renders

  useEffect(() => {
    if (editing) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editing])

  const save = () => {
    const value = draft.trim()
    if (value) dispatch({ type: 'edited', id: task.id, text: value })
    else setDraft(task.text)
    setEditing(false)
  }

  return (
    <li>
      {editing ? (
        <input
          ref={editRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
      ) : (
        <label className={task.done ? 'done' : ''}>
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => dispatch({ type: 'toggled', id: task.id })}
          />
          <span onDoubleClick={() => setEditing(true)}>{task.text}</span>
        </label>
      )}
      <span className="muted small">renders: {renders.current}</span>
      <button onClick={() => dispatch({ type: 'removed', id: task.id })} aria-label={`Remove ${task.text}`}>
        ✕
      </button>
    </li>
  )
}

export default memo(TaskItem)