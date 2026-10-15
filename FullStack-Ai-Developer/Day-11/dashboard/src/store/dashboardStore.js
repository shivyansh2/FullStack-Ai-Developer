import { create } from 'zustand'

export const RANGES = ['24h', '7d', '30d']

export const useDashboardStore = create((set) => ({
  range: '7d',
  setRange: (range) => set({ range }),
}))