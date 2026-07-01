import Header from '../components/Header'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InventoryApprovalCard from '../components/InventoryApprovalCard'
import Pagination from '../components/Pagination'
import RejectReasonModal from '../components/RejectReasonModal'
import {
  fetchInventoryApprovalItems,
  submitInventoryApproval,
} from '../services/inventoryApproval'
import {
  InventoryApprovalItem,
  InventoryApprovalStatus,
} from '../types'
import { GUDANG } from '../constants'

type SortOrder = 'desc' | 'asc'
type Decision = 'Terima' | 'Tolak'

// Konversi tanggal "DD/MM/YYYY" atau "YYYY-MM-DD" menjadi timestamp number.
function parseTanggalToTime(d?: string): number {
  if (!d) return 0
  const trimmed = d.trim()
  if (!trimmed) return 0

  // DD/MM/YYYY
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) {
    const [, dd, mm, yyyy] = slash
    const t = new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime()
    return Number.isNaN(t) ? 0 : t
  }

  // Fallback: percayakan ke parser Date standar (ISO dll).
  const t = new Date(trimmed).getTime()
  return Number.isNaN(t) ? 0 : t
}

export default function InventoryApprovalPage() {
  const [items, setItems] = useState<InventoryApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cabang, setCabang] = useState('')
  const [dataCache, setDataCache] = useState<Record<string, InventoryApprovalItem[]>>({})

  const [sort, setSort] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [decided, setDecided] = useState<Record<string, Decision>>({})
  const [rejectingItem, setRejectingItem] = useState<InventoryApprovalItem | null>(null)
  const pageSize = 8

  // Refs untuk menghindari stale closure di dalam loadData
  const dataCacheRef = useRef(dataCache)
  const cabangRef = useRef(cabang)
  useEffect(() => {
    dataCacheRef.current = dataCache
  }, [dataCache])
  useEffect(() => {
    cabangRef.current = cabang
  }, [cabang])

  const loadData = useCallback(async (forceRefresh = false) => {
    const currentCabang = cabangRef.current
    const cache = dataCacheRef.current
    if (!forceRefresh && cache[currentCabang] !== undefined) {
      setItems(cache[currentCabang])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchInventoryApprovalItems(currentCabang)
      setItems(data)
      setDataCache(prev => ({
        ...prev,
        [currentCabang]: data,
      }))
    } catch (e) {
      setError('Tidak dapat memuat data approval inventaris')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [cabang, loadData])

  const filtered = useMemo(() => {
    let base = items.filter(i => {
      const key = `${i.trxId}||${i.itemId}`
      const status = i.status === 'Pending' && decided[key] ? decided[key] : i.status
      // Hanya tampilkan yang masih menunggu keputusan (Pending / Terima / Tolak dari API atau state lokal)
      void status
      return true
    })

    // Client-side filter lebih robust (trim + lowercase)
    if (cabang) {
      const target = cabang.toLowerCase().trim()
      base = base.filter(i => (i.outlet || '').toLowerCase().trim() === target)
    }

    return base
  }, [items, cabang, decided])

  const sorted = useMemo(() => {
    const next = [...filtered].sort((a, b) => {
      const da = parseTanggalToTime(a.date)
      const db = parseTanggalToTime(b.date)
      return sort === 'desc' ? db - da : da - db
    })
    return next
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageData = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleCabangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCabang(e.target.value)
    setPage(1)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortOrder)
    setPage(1)
  }

  const applyLocalDecision = (item: InventoryApprovalItem, decision: Decision) => {
    const key = `${item.trxId}||${item.itemId}`
    setDecided(prev => ({ ...prev, [key]: decision }))
    // Update items dan dataCache secara terpisah; updater harus pure (tanpa side-effect).
    setItems(prev => {
      const nextStatus: InventoryApprovalStatus = decision
      return prev.map(it =>
        it.trxId === item.trxId && it.itemId === item.itemId
          ? { ...it, status: nextStatus }
          : it,
      )
    })
    setDataCache(prev => {
      const currentCabang = cabangRef.current
      const list = prev[currentCabang] || []
      const next = list.map(it =>
        it.trxId === item.trxId && it.itemId === item.itemId
          ? { ...it, status: decision }
          : it,
      )
      if (next === list) return prev
      return { ...prev, [currentCabang]: next }
    })
  }

  const submitDecision = async (
    item: InventoryApprovalItem,
    decision: Decision,
    reason?: string,
  ) => {
    if (!item.trxId || !item.itemId || !item.outlet) {
      alert('Data tidak lengkap untuk approval inventaris')
      return
    }
    if (decision === 'Tolak' && !reason) {
      alert('Alasan penolakan wajib diisi')
      return
    }

    const key = `${item.trxId}||${item.itemId}`
    setSubmitting(prev => ({ ...prev, [key]: true }))
    try {
      await submitInventoryApproval({
        trxId: item.trxId,
        itemId: item.itemId,
        outlet: item.outlet,
        status: decision,
        alasan: decision === 'Tolak' ? reason : undefined,
      })
      applyLocalDecision(item, decision)
      alert(
        decision === 'Terima'
          ? 'Approval inventaris berhasil dikirim'
          : 'Penolakan inventaris berhasil dikirim',
      )
    } catch (e) {
      alert('Gagal mengirim approval inventaris')
    } finally {
      setSubmitting(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleAccept = async (item: InventoryApprovalItem) => {
    await submitDecision(item, 'Terima')
  }

  const handleRejectClick = (item: InventoryApprovalItem) => {
    setRejectingItem(item)
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingItem) return
    const item = rejectingItem
    setRejectingItem(null)
    await submitDecision(item, 'Tolak', reason)
  }

  return (
    <div className="container">
      <Header title="Approval Inventaris" backTo="/" />
      <section className="hero">
        <h1>Approval Permintaan Inventaris</h1>
        <p>Cek &amp; setujui pengajuan peralatan</p>
      </section>
      <section className="panel">
        <div className="form-grid">
          <div className="control">
            <label className="label">Filter Cabang</label>
            <select className="select" value={cabang} onChange={handleCabangChange}>
              <option value="">Semua Cabang</option>
              {GUDANG.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
          <div className="control">
            <label className="label">Urutkan Tanggal</label>
            <select className="select" value={sort} onChange={handleSortChange}>
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>
        </div>
      </section>
      <section
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        {loading ? (
          <div className="dropdown-empty">Memuat data…</div>
        ) : error ? (
          <div
            className="dropdown-empty"
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>
            <button className="btn" onClick={() => loadData(true)}>Refresh Data</button>
          </div>
        ) : pageData.length === 0 ? (
          <div className="dropdown-empty">Tidak ada data</div>
        ) : (
          pageData.map((i, idx) => {
            const key = `${i.trxId}||${i.itemId}`
            const localDecision = decided[key]
            const isAccepted =
              localDecision === 'Terima' || (!localDecision && i.status === 'Terima')
            const isRejected =
              localDecision === 'Tolak' || (!localDecision && i.status === 'Tolak')
            return (
              <InventoryApprovalCard
                key={`${i.trxId}-${i.itemId}-${idx}`}
                trxId={i.trxId}
                date={i.date}
                itemId={i.itemId}
                itemName={i.itemName}
                outlet={i.outlet}
                spesifikasi={i.spesifikasi}
                quantity={i.quantity}
                totalEstimasiBiaya={i.totalEstimasiBiaya}
                status={i.status}
                verifikasiSpv={i.verifikasiSpv}
                nominalDisetujui={i.nominalDisetujui}
                onAccept={() => handleAccept(i)}
                onReject={() => handleRejectClick(i)}
                isSubmitting={submitting[key]}
                isAccepted={isAccepted}
                isRejected={isRejected}
              />
            )
          })
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>

      <RejectReasonModal
        isOpen={rejectingItem !== null}
        onClose={() => setRejectingItem(null)}
        onConfirm={handleRejectConfirm}
        trxId={rejectingItem?.trxId || ''}
        itemName={rejectingItem?.itemName || ''}
        isLoading={
          rejectingItem
            ? submitting[`${rejectingItem.trxId}||${rejectingItem.itemId}`]
            : false
        }
      />
    </div>
  )
}
