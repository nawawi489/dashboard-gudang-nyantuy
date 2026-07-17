import { useState, useRef, useEffect, useMemo } from 'react'
import { WEBHOOK_GET_BARANG } from '../config'

type Props = {
  value: string
  onChange: (value: string) => void
}

export default function JenisBarangDropdown({ value, onChange }: Props) {
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadItems = async () => {
    if (loading || items.length > 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(WEBHOOK_GET_BARANG, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data?.data || data?.items || [])
      const types = new Set<string>()
      for (const row of list) {
        const jenis = (row['Jenis Barang'] || '').trim()
        if (jenis) types.add(jenis)
      }
      setItems(Array.from(types).sort())
    } catch (e) {
      console.error('Gagal mengambil data jenis barang', e)
      setError('Tidak dapat memuat data jenis barang')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? items.filter(it => it.toLowerCase().includes(q)) : items
  }, [items, search])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setOpen(true)
    setSearch(nextValue)
    onChange(nextValue)
    if (!open) loadItems()
  }

  const handleInputFocus = () => {
    setOpen(true)
    loadItems()
  }

  const handleItemClick = (item: string) => {
    onChange(item)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={dropdownRef} className="control dropdown">
      <label className="label">Jenis Barang</label>
      <input
        className="input"
        placeholder="Cari atau pilih jenis barang"
        value={open ? search : value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
      />
      {open && (
        <div className="dropdown-panel" onMouseDown={e => e.preventDefault()}>
          {loading ? (
            <div className="dropdown-empty">Memuat data…</div>
          ) : error ? (
            <div className="dropdown-empty">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="dropdown-empty">Tidak ada hasil</div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item}
                className="dropdown-item"
                onClick={() => handleItemClick(item)}
              >
                <span>{item}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
