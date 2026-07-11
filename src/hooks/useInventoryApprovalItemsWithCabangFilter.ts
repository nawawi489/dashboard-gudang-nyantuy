import { useEffect, useState } from 'react'
import { InventoryApprovalItem } from '../types'
import { fetchInventoryApprovalItems } from '../services/inventoryApproval'

type UseInventoryApprovalItemsResult = {
  items: InventoryApprovalItem[]
  loading: boolean
  error: string | null
  cabangFilter: string
  setCabangFilter: (value: string) => void
  loadData: (forceRefresh?: boolean) => Promise<void>
}

export function useInventoryApprovalItemsWithCabangFilter(
  defaultErrorMessage: string,
  fetcher: (cabang?: string) => Promise<InventoryApprovalItem[]> = fetchInventoryApprovalItems,
): UseInventoryApprovalItemsResult {
  const [items, setItems] = useState<InventoryApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cabangFilter, setCabangFilter] = useState('')
  const [dataCache, setDataCache] = useState<Record<string, InventoryApprovalItem[]>>({})

  const loadData = async (forceRefresh = false) => {
    if (!forceRefresh && dataCache[cabangFilter] !== undefined) {
      setItems(dataCache[cabangFilter])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetcher(cabangFilter)
      setItems(data)
      setDataCache((prev) => ({
        ...prev,
        [cabangFilter]: data,
      }))
    } catch (e) {
      setError(defaultErrorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [cabangFilter])

  return {
    items,
    loading,
    error,
    cabangFilter,
    setCabangFilter,
    loadData,
  }
}
