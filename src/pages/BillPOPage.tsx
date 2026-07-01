import Header from '../components/Header'
import { useMemo, useState } from 'react'
import BillCard from '../components/BillCard'
import Pagination from '../components/Pagination'
import PaymentProofModal from '../components/PaymentProofModal'
import { submitPaymentProof } from '../services/payment'
import { ApprovalItem } from '../types'
import { GUDANG } from '../constants'
import { useApprovalItemsWithCabangFilter } from '../hooks/useApprovalItemsWithCabangFilter'

interface BillGroup {
  invoice: string
  trxId: string
  cabang: string
  items: ApprovalItem[]
  date?: string
}

const ITEMS_PER_PAGE = 9

export default function BillPOPage() {
  const {
    items,
    loading,
    error,
    cabangFilter,
    setCabangFilter,
    loadData,
  } = useApprovalItemsWithCabangFilter('Tidak dapat memuat data tagihan')

  const [currentPage, setCurrentPage] = useState(1)

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    trxId: string
    cabang: string
    invoice: string
    isSubmitting: boolean
  }>({
    isOpen: false,
    trxId: '',
    cabang: '',
    invoice: '',
    isSubmitting: false
  })

  // Group items by nomorInvoice AND cabang
  const groupedItems = useMemo<BillGroup[]>(() => {
    // 1. Filter items
    const filtered = items.filter(item => {
      const isHutang = (item.statusPembayaran || '').toLowerCase() === 'hutang'
      const isValidStatus = ['Terima', 'Pending'].includes(item.status || '')
      const matchesCabang = !cabangFilter || (item.outlet || '').toLowerCase().trim() === cabangFilter.toLowerCase().trim()
      const inv = (item.nomorInvoice || '').trim()
      const hasInvoice = inv.length > 0
      return isHutang && isValidStatus && matchesCabang && hasInvoice
    })

    // 2. Group by composite key
    const groups: Record<string, ApprovalItem[]> = {}
    filtered.forEach(item => {
      const inv = (item.nomorInvoice || '').trim() || 'UNKNOWN'
      const cabang = item.outlet || 'UNKNOWN'
      const key = `${inv}||${cabang}`
      
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    
    // 3. Convert to array and sort
    return Object.entries(groups)
      .map(([key, groupItems]) => {
        const [invoice, cabang] = key.split('||')
        return {
          invoice,
          trxId: groupItems[0]?.trxId || 'UNKNOWN',
          cabang,
          items: groupItems,
          date: groupItems[0]?.date
        }
      })
      .sort((a, b) => {
         const da = a.date ? new Date(a.date).getTime() : 0
         const db = b.date ? new Date(b.date).getTime() : 0
         return db - da
      })
  }, [items, cabangFilter])

  // Pagination Logic
  const totalPages = Math.ceil(groupedItems.length / ITEMS_PER_PAGE)
  const paginatedItems = groupedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleOpenModal = (trxId: string, cabangName: string, invoiceNumber: string) => {
    setModalState(prev => ({
      ...prev,
      isOpen: true,
      trxId: trxId,
      cabang: cabangName,
      invoice: invoiceNumber
    }))
  }

  const handleCloseModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
      trxId: '',
      cabang: ''
    }))
  }

  const handleCabangFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCabangFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleSubmitPaymentProof = async (trxId: string, file: File, invoiceNumber: string) => {
    setModalState(prev => ({ ...prev, isSubmitting: true }))
    try {
      const success = await submitPaymentProof(trxId, file, modalState.cabang, invoiceNumber)
      if (success) {
        alert(`Bukti pembayaran untuk ${trxId} berhasil dikirim!`)
        handleCloseModal()
        // Optional: Refresh data to reflect changes if needed
        // loadData() 
      }
    } catch (e) {
      alert('Gagal mengirim bukti pembayaran. Silakan coba lagi.')
    } finally {
      setModalState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const renderContent = () => {
    if (loading) {
      return <div className="dropdown-empty">Memuat data…</div>
    }

    if (error) {
      return (
        <div className="dropdown-empty" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>
          <button className="btn" onClick={() => loadData(true)}>Refresh Data</button>
        </div>
      )
    }

    if (groupedItems.length === 0) {
      return <div className="dropdown-empty">Tidak ada data tagihan</div>
    }

    return (
      <>
        {paginatedItems.map((group) => (
          <BillCard
            key={`${group.invoice}-${group.cabang}`}
            trxId={group.trxId}
            items={group.items}
            onInputPaymentProof={() => handleOpenModal(group.trxId, group.cabang, group.invoice)}
            invoice={group.invoice}
            ctaLabel="Input Bukti Pembayaran"
          />
        ))}
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </>
    )
  }

  return (
    <div className="container">
      <Header title="Tagihan PO" backTo="/" />
      <section className="hero">
        <h1>Tagihan PO</h1>
        <p>Input bukti pembayaran tagihan PO</p>
      </section>

      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="form-grid">
          <div className="control">
            <label className="label">Filter Cabang</label>
            <select 
              className="select" 
              value={cabangFilter} 
              onChange={handleCabangFilterChange}
            >
              <option value="">Semua Cabang</option>
              {GUDANG.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
        </div>
      </section>
      
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {renderContent()}
      </section>

      <PaymentProofModal 
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        trxId={modalState.trxId}
        cabang={modalState.cabang}
        invoice={modalState.invoice}
        onSubmit={handleSubmitPaymentProof}
        isLoading={modalState.isSubmitting}
        variant="payment"
      />
    </div>
  )
}
