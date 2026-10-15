import Renders from './Renders'

export default function QueryBoundary({ query, isEmpty, empty = 'Nothing here yet.', name, children }) {
  const { data, error, isPending, isError, isFetching, isPlaceholderData, dataUpdatedAt, refetch } = query

  // 1. loading: first load, nothing cached
  if (isPending) return <p className="muted">Loading…</p>

  // 2. error with nothing to show
  if (isError && data === undefined) {
    return (
      <p className="error" role="alert">
        {isFetching ? (
          'Retrying…'
        ) : (
          <>
            {error.message} <button onClick={() => refetch()}>Retry</button>
          </>
        )}
      </p>
    )
  }

  return (
    <div>
      {/* 3. a background refresh failed: keep the old data on screen */}
      {isError && !isFetching && (
        <p className="error" role="alert">
          Couldn't refresh, showing older data. <button onClick={() => refetch()}>Retry</button>
        </p>
      )}
      <div className={isPlaceholderData ? 'dim' : undefined}>
        {/* 4. empty vs 5. data */}
        {isEmpty?.(data) ? <p className="muted">{empty}</p> : children(data)}
      </div>
      <p className="muted small">
        {isFetching ? 'Refreshing…' : dataUpdatedAt > 0 && `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`}
        {name && <Renders name={name} />}
      </p>
    </div>
  )
}