
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App, { TaskStats } from './App'

describe('TaskStats component', () => {
  it('shows total, completed, and pending tasks', () => {
    const tasks = [
      { id: 1, title: 'Task A', completed: true },
      { id: 2, title: 'Task B', completed: false },
      { id: 3, title: 'Task C', completed: false },
    ]

    render(<TaskStats tasks={tasks} />)

    const summary = screen.getByRole('region', {
      name: 'Task summary',
    })

    expect(within(summary).getByText('3')).toBeInTheDocument()
    expect(within(summary).getByText('1')).toBeInTheDocument()
    expect(within(summary).getByText('2')).toBeInTheDocument()
  })
})

describe('Solo Daily dashboard', () => {
  it('renders the dashboard and initial tasks', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Finish the React dashboard'),
    ).toBeInTheDocument()
  })

  it('adds a new task', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(
      screen.getByRole('textbox', { name: 'New task' }),
      'Review pull request',
    )
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(
      screen.getByText('Review pull request'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('textbox', { name: 'New task' }),
    ).toHaveValue('')
  })

  it('marks a task as completed', async () => {
    const user = userEvent.setup()
    render(<App />)

    const checkbox = screen.getByRole('checkbox', {
      name: 'Finish the React dashboard',
    })

    await user.click(checkbox)

    expect(checkbox).toBeChecked()
  })

  it('navigates to the Analytics view', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Analytics' }))

    expect(
      screen.getByRole('heading', {level:1, name: 'Analytics' }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Your task progress will appear here.'),
    ).toBeInTheDocument()
  })

  it('does not add an empty task', async () => {
    const user = userEvent.setup()
    render(<App />)

    const initialCount = screen.getByText('3', {
      selector: 'strong',
    })

    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(initialCount).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
  })
})
