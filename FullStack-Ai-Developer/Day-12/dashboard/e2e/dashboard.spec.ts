
import { test, expect } from '@playwright/test'

test('dashboard loads and displays task statistics', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Dashboard' }),
  ).toBeVisible()

  const summary = page.getByRole('region', {
    name: 'Task summary',
  })

  await expect(summary.getByText('Total tasks')).toBeVisible()
  await expect(summary.getByText('Completed')).toBeVisible()
  await expect(summary.getByText('Pending')).toBeVisible()
})
