import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import { fetchPeralatanList, confirmPeralatan } from '../../services/peralatan'
import { PeralatanItem, PeralatanConfirmData } from '../../types'
import Footer from './Footer'
import PeralatanCard from './PeralatanCard'
import PeralatanConfirmModal from './PeralatanConfirmModal'
import { getTodayDateJakarta } from '../../utils/date'

interface PeralatanDashboardProps {
  outlet: string
  onBack: () => void
}

const PeralatanDashboard = ({ outlet, onBack }: PeralatanDashboardProps) => {
  const [list, setList] = useState<PeralatanItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<PeralatanItem | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const PAGE_SIZE = 6
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [confirmedIds, setConfirmedIds] = useState<string[]>([])

  const reloadPeralatan = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPeralatanList(outlet)
      setList(data)
      setConfirmedIds([])
      setCurrentPage(1)
      setActive(null)
    } catch (e) {
      setError('Gagal memuat data peralatan masuk')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadPeralatan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outlet])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(list.length / PAGE_SIZE)), [list.length])
  const startIndex = useMemo(() => (currentPage - 1) * PAGE_SIZE, [currentPage])
  const paginatedList = useMemo(() => list.slice(startIndex, startIndex + PAGE_SIZE), [list, startIndex])

  const startConfirm = (item: PeralatanItem) => setActive(item)

  const submitConfirm = async (data: {
    jumlahDiterima: number
    keterangan: string
    nomorInvoice: string
    ppn: number
    totalTagihan: number
    fotoFile: File | null
    fotoNotaFile: File | null
  }) => {
    if (!active) return
    setSubmitting(true)
    setError(null)
    try {
      const status = data.jumlahDiterima >= active.qty ? 'DITERIMA' : 'KURANG'

      const payload: PeralatanConfirmData = {
        id_pengajuan: active.id_pengajuan,
        id_peralatan: active.id_peralatan,
        nama_peralatan: active.nama_peralatan,
        spesifikasi: active.spesifikasi,
        qty: active.qty,
        jumlah_diterima: data.jumlahDiterima,
        outlet,
        nomor_invoice: data.nomorInvoice,
        ppn: data.ppn,
        total_tagihan: data.totalTagihan,
        foto_dokumentasi: data.fotoFile,
        foto_dokumentasi_nota: data.fotoNotaFile,
        keterangan_spv: data.keterangan,
        tanggal_konfirmasi: getTodayDateJakarta(),
        status,
      }
      await confirmPeralatan(payload)

      setConfirmedIds(prev => [...prev, active.id_pengajuan])
      setActive(null)
    } catch (e) {
      setError('Gagal mengirim konfirmasi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between gap-3">
           <button type="button" onClick={onBack} className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors" aria-label="Kembali">
             <ArrowLeft size={20} />
           </button>
           <div className="flex-1">
             <h1 className="font-bold text-slate-800 text-lg">Konfirmasi Peralatan Masuk</h1>
             <div className="text-xs text-slate-500">{outlet}</div>
           </div>
          <button onClick={reloadPeralatan} aria-label="Reload Data" className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>Tutup</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-500">
            <Loader2 size={32} className="animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                <ClipboardCheck size={32} className="opacity-50" />
                <p>Tidak ada peralatan menunggu konfirmasi.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedList.map((item, idx) => (
                    <PeralatanCard
                      key={`${item.id_pengajuan}-${item.id_peralatan ?? idx}`}
                      data={item}
                      onConfirm={startConfirm}
                      isConfirmed={confirmedIds.includes(item.id_pengajuan)}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-slate-500">
                    Menampilkan {list.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, list.length)} dari {list.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-slate-600">Halaman {currentPage} / {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {active && (
                  <PeralatanConfirmModal
                    item={active}
                    open={!!active}
                    onClose={() => setActive(null)}
                    onSubmit={submitConfirm}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default PeralatanDashboard
