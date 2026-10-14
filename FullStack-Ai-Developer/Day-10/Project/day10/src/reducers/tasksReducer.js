export const initialTasks = [
  { id: 't1', text: 'Learn useReducer', done: false },
  { id: 't2', text: 'Split context into state + dispatch', done: false },
  { id: 't3', text: 'Lazy-load the Analytics page', done: true },
]

export function tasksReducer(state, action) {
  switch (action.type) {
    case 'added':
      return [...state, { id: action.id, text: action.text, done: false }]
    case 'toggled':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
    case 'edited':
      return state.map((t) => (t.id === action.id ? { ...t, text: action.text } : t))
    case 'removed':
      return state.filter((t) => t.id !== action.id)
    case 'cleared':
      return state.filter((t) => !t.done)
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}