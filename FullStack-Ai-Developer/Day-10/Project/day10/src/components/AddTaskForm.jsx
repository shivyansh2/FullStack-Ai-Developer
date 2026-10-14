import { useEffect, useRef, useState } from 'react'
import { useTasksDispatch } from '../context/TasksContext'

export default function AddTaskForm() {
  const dispatch = useTasksDispatch()
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    const value = text.trim()
    if (value) {
      dispatch({ type: 'added', id: crypto.randomUUID(), text: value })
      setText('')
    }
    inputRef.current.focus()
  }

  return (
    <form className="card row" onSubmit={onSubmit}>
      <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder="New task…" />
      <button type="submit">Add</button>
    </form>
  )
}