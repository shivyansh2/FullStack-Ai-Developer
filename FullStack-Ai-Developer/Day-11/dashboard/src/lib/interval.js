// Merge Intervals: sort by start, fold overlaps. O(n log n)
export function mergeIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  const out = []
  for (const cur of sorted) {
    const last = out[out.length - 1]
    if (last && cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1])
    else out.push([...cur]) // copy so we never mutate the caller's data
  }
  return out
}

// Insert Interval: input sorted + non-overlapping. O(n), one pass.
export function insertInterval(intervals, newInterval) {
  const out = []
  let [start, end] = newInterval
  let i = 0
  while (i < intervals.length && intervals[i][1] < start) out.push(intervals[i++]) // 1) strictly before
  while (i < intervals.length && intervals[i][0] <= end) {                         // 2) overlapping: absorb
    start = Math.min(start, intervals[i][0])
    end = Math.max(end, intervals[i][1])
    i++
  }
  out.push([start, end])
  while (i < intervals.length) out.push(intervals[i++])                            // 3) strictly after
  return out
}