import { createContext, useContext, useReducer } from 'react'
import { initialTasks, tasksReducer } from '../reducers/tasksReducer'

const TasksStateContext = createContext(null)
const TasksDispatchContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks)
  return (
    <TasksStateContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksStateContext.Provider>
  )
}

export function useTasks() {
  const value = useContext(TasksStateContext)
  if (value === null) throw new Error('useTasks must be used inside <TasksProvider>')
  return value
}

export function useTasksDispatch() {
  const value = useContext(TasksDispatchContext)
  if (value === null) throw new Error('useTasksDispatch must be used inside <TasksProvider>')
  return value
}