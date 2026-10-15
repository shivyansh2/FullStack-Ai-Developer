import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { dashboardKeys } from '../hooks/useDashboardQueries'
import Renders from './Renders'
import { memo } from 'react'

function RefreshButton() {
  const queryClient = useQueryClient()
  const fetching = useIsFetching({ queryKey: dashboardKeys.all }) > 0

  return (
    <>
      <button disabled={fetching} onClick={() => queryClient.invalidateQueries({ queryKey: dashboardKeys.all })}>
        {fetching ? 'Refreshing…' : 'Refresh'}
      </button>
      <Renders name="RefreshButton" />
    </>
  )
}
export default memo (RefreshButton)