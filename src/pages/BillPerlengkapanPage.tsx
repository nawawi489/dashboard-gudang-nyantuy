import Header from '../components/Header'
import { useMemo, useState } from 'react'
import BillCard from '../components/BillCard'
import Pagination from '../components/Pagination'
import PaymentProofModal from '../components/PaymentProofModal'
import { submitPerlengkapanPaymentProof } from '../services/payment'
import { fetchBillPerlengkapanItems } from '../services/perlengkapanRequest'
import { ApprovalItem, InventoryApprovalItem } from '../types'
import { GUDANG } from '../constants'
import { useInventoryApprovalItemsWithCabangFilter } from '../hooks/useInventoryApprovalItemsWithCabangFilter'

interface BillGroup {
  invoice: string
  trxId: string
  cabang: string
  items: InventoryApprovalItem[]
  date?: string
  totalTagihan: number
}

function toApprovalItems(items: InventoryApprovalItem[], grandTotal: number): ApprovalItem[] {
  return items.map(item => ({
    trxId: item.trxId,
    date: item.tanggalTerima || item.date,
    itemName: item.itemName,
    outlet: item.outlet,
    supplier: item.supplier || '',
    unit: 'Pcs',
    quantity: item.quantity,
    price: 0,
    status: item.status,
    statusPembayaran: item.statusPembayaran,
    grandTotal,
    nomorInvoice: item.nomorInvoice,
  }))
}

const ITEMS_PER_PAGE = 9

export default function BillPerlengkapanPage() {
  const {
    items,
    loading,
    error,
    cabangFilter,
    setCabangFilter,
    loadData,
  } = useInventoryApprovalItemsWithCabangFilter('Tidak dapat memuat data tagihan perlengkapan', fetchBillPerlengkapanItems)

  const [currentPage, setCurrentPage] = useState(1)

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

  const groupedItems = useMemo<BillGroup[]>(() => {
    const filtered = items.filter(item => {
      const isHutang = (item.statusPembayaran || '').toLowerCase() === 'hutang'
      const isValidStatus = ['Terima', 'Pending'].includes(item.status || '')
      const matchesCabang = !cabangFilter || (item.outlet || '').toLowerCase().trim() === cabangFilter.toLowerCase().trim()
      return isHutang && isValidStatus && matchesCabang
    })

    const groups: Record<string, InventoryApprovalItem[]> = {}
    filtered.forEach(item => {
      const invoice = (item.nomorInvoice || item.trxId || '').trim() || 'UNKNOWN'
      const cabang = item.outlet || 'UNKNOWN'
      const key = `${invoice}||${cabang}`

      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })

    return Object.entries(groups)
      .map(([key, groupItems]) => {
        const [invoice, cabang] = key.split('||')
        return {
          invoice,
          trxId: groupItems[0]?.trxId || invoice,
          cabang,
          items: groupItems,
          date: groupItems[0]?.date,
          totalTagihan: groupItems[0]?.totalEstimasiBiaya || 0,
        }
      })
      .sort((a, b) => {
         const da = a.date ? new Date(a.date).getTime() : 0
         const db = b.date ? new Date(b.date).getTime() : 0
         return db - da
      })
  }, [items, cabangFilter])

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

  const handleSubmitPaymentProof = async (trxId: string, file: File) => {
    setModalState(prev => ({ ...prev, isSubmitting: true }))
    try {
      const success = await submitPerlengkapanPaymentProof(trxId, file, modalState.cabang, modalState.invoice)
      if (success) {
        alert(`Bukti pembayaran untuk ${trxId} berhasil dikirim!`)
        handleCloseModal()
        loadData(true)
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
            key={`${group.trxId}-${group.cabang}`}
            trxId={group.trxId}
            items={toApprovalItems(group.items, group.totalTagihan)}
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
      <Header title="Tagihan Perlengkapan" backTo="/" />
      <section className="hero">
        <h1>Tagihan Perlengkapan</h1>
        <p>Input bukti pembayaran tagihan perlengkapan</p>
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
