import Header from '../components/Header'
import { useEffect, useMemo, useState } from 'react'
import ApprovalCard from '../components/ApprovalCard'
import Pagination from '../components/Pagination'
import { fetchApprovalItems, submitFinanceVerification } from '../services/approval'
import { ApprovalItem, ApprovalStatus } from '../types'
import { GUDANG } from '../constants'

type SortOrder = 'desc' | 'asc'

export default function ApprovalPage() {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cabang, setCabang] = useState('')
  
  // Cache data per cabang untuk menghindari request berulang
  const [dataCache, setDataCache] = useState<Record<string, ApprovalItem[]>>({})

  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [acceptedKeys, setAcceptedKeys] = useState<Record<string, boolean>>({})
  const pageSize = 8

  const loadData = async (forceRefresh = false) => {
    // Jika data sudah ada di cache dan tidak dipaksa refresh, gunakan cache
    if (!forceRefresh && dataCache[cabang] !== undefined) {
      setItems(dataCache[cabang])
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Pass cabang ke API untuk server-side filtering
      const data = await fetchApprovalItems(cabang)
      setItems(data)
      
      // Simpan ke cache
      setDataCache(prev => ({
        ...prev,
        [cabang]: data
      }))
    } catch (e) {
      setError('Tidak dapat memuat data approval')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [cabang]) // Refetch saat cabang berubah

  const filtered = useMemo(() => {
    // Filter data yang VerifikasiFinance = Pending (VerifikasiSPV diabaikan)
    let base = items.filter(i => {
      const key = `${i.trxId}||${i.itemId}`
      return i.status === 'Pending' || acceptedKeys[key]
    })
    
    // Client-side filter lebih robust (trim + lowercase) untuk menangani perbedaan casing/spasi dari server
    if (cabang) {
      const target = cabang.toLowerCase().trim()
      base = base.filter(i => (i.outlet || '').toLowerCase().trim() === target)
    }
    
    // Hapus filter status dari UI karena sudah difilter di awal (hanya 'Pending')
    // Tapi jika user ingin filter lagi (misal status pembayaran), bisa ditambahkan logic lain
    
    return base
  }, [items, cabang, acceptedKeys])

  const sorted = useMemo(() => {
    const toTime = (d?: string) => (d ? new Date(d).getTime() || 0 : 0)
    const next = [...filtered].sort((a, b) => {
      const da = toTime(a.date)
      const db = toTime(b.date)
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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value)
    setPage(1)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortOrder)
    setPage(1)
  }

  const handleAccept = async (item: ApprovalItem) => {
    if (!item.trxId || !item.itemId || !item.outlet) {
      alert('Data tidak lengkap untuk verifikasi finance')
      return
    }

    const key = `${item.trxId}||${item.itemId}`
    setSubmitting(prev => ({ ...prev, [key]: true }))
    try {
      await submitFinanceVerification({
        trxId: item.trxId,
        itemId: item.itemId,
        outlet: item.outlet,
        nomorInvoice: item.nomorInvoice || '',
      })
      setAcceptedKeys(prev => ({ ...prev, [key]: true }))
      setItems(prev => {
        const next = prev.map(it =>
          it.trxId === item.trxId && it.itemId === item.itemId
            ? { ...it, status: 'Terima' as ApprovalStatus }
            : it
        )
        setDataCache(cache => ({
          ...cache,
          [cabang]: next
        }))
        return next
      })
      alert('Verifikasi finance berhasil dikirim')
    } catch (e) {
      alert('Gagal mengirim verifikasi finance')
    } finally {
      setSubmitting(prev => ({ ...prev, [key]: false }))
    }
  }

  return (
    <div className="container">
      <Header title="Approval" backTo="/" />
      <section className="hero">
        <h1>Approval</h1>
        <p>Cek status pesanan PO</p>
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
          {/* Filter Status dihapus karena data sudah difilter: Finance=Pending (VerifikasiSPV diabaikan) */}
          <div className="control">
            <label className="label">Urutkan Tanggal</label>
            <select className="select" value={sort} onChange={handleSortChange}>
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>
        </div>
      </section>
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {loading ? (
          <div className="dropdown-empty">Memuat data…</div>
        ) : error ? (
          <div className="dropdown-empty" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>
            <button className="btn" onClick={() => loadData(true)}>Refresh Data</button>
          </div>
        ) : pageData.length === 0 ? (
          <div className="dropdown-empty">Tidak ada data</div>
        ) : (
          pageData.map((i, idx) => (
            <ApprovalCard
              key={i.trxId + i.itemName + i.unit + idx}
              trxId={i.trxId}
              tag={i.tag}
              date={i.date}
              itemId={i.itemId}
              itemName={i.itemName}
              cabang={i.outlet}
              supplier={i.supplier}
              unit={i.unit}
              quantity={i.quantity}
              price={i.price}
              status={i.status}
              onAccept={() => handleAccept(i)}
              isSubmitting={submitting[`${i.trxId}||${i.itemId}`]}
              isAccepted={acceptedKeys[`${i.trxId}||${i.itemId}`] || i.status === 'Terima'}
            />
          ))
        )}
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </section>
    </div>
  )
}
