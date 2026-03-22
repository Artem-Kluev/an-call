interface HistoryItem {
  id: string
  date: string
}

export const useCallHistory = () => {
  const STORAGE_KEY = 'history_ids'

  const getHistory = (): HistoryItem[] => {
    if (!import.meta.client) return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('Failed to parse history', e)
      return []
    }
  }

  const saveHistory = (history: HistoryItem[]) => {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  }

  const cleanOldHistory = () => {
    const history = getHistory()
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    const newHistory = history.filter(item => {
      try {
        return new Date(item.date).getTime() > oneHourAgo
      } catch {
        return false // Remove invalid dates
      }
    })
    
    if (newHistory.length !== history.length) {
      saveHistory(newHistory)
    }
    return newHistory
  }

  const addToHistory = (id: string) => {
    if (!id) return
    const history = cleanOldHistory()
    if (!history.find(item => item.id === id)) {
      history.push({ id, date: new Date().toISOString() })
      saveHistory(history)
    }
  }

  const getHistoryIds = () => {
    const history = cleanOldHistory()
    return history.map(item => item.id)
  }

  return {
    addToHistory,
    getHistoryIds,
    cleanOldHistory
  }
}
