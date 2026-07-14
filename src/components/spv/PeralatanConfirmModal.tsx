import { useState, FormEvent, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { PeralatanItem } from '../../types'
import FileUpload from './FileUpload'

interface PeralatanConfirmModalProps {
  item: PeralatanItem
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    jumlahDiterima: number
    keterangan: string
    fotoFile: File | null
    fotoNotaFile: File | null
  }) => void
}

const PeralatanConfirmModal = ({ item, open, onClose, onSubmit }: PeralatanConfirmModalProps) => {
  const [jumlahDiterima, setJumlahDiterima] = useState<string>(String(item.qty))
  const [keterangan, setKeterangan] = useState<string>('')
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoNotaFile, setFotoNotaFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      const savedData = localStorage.getItem(`peralatan_draft_${item.id_pengajuan}`)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          if (parsed.jumlahDiterima) setJumlahDiterima(parsed.jumlahDiterima)
          if (parsed.keterangan) setKeterangan(parsed.keterangan)
        } catch (e) {
          console.error('Failed to restore draft', e)
        }
      }
      setIsLoaded(true)
    }
  }, [open, item.id_pengajuan])

  useEffect(() => {
    if (open && isLoaded) {
      const draft = { jumlahDiterima, keterangan }
      localStorage.setItem(`peralatan_draft_${item.id_pengajuan}`, JSON.stringify(draft))
    }
  }, [open, isLoaded, jumlahDiterima, keterangan, item.id_pengajuan])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const jd = parseInt(jumlahDiterima)
    if (isNaN(jd) || jd < 0) { setError('Jumlah diterima tidak valid.'); return }
    if (!fotoFile) { setError('Foto dokumentasi penerimaan wajib diupload.'); return }
    if (!fotoNotaFile) { setError('Foto dokumentasi nota wajib diupload.'); return }

    setIsSubmitting(true)
    try {
      await onSubmit({
        jumlahDiterima: jd,
        keterangan,
        fotoFile,
        fotoNotaFile,
      })
      localStorage.removeItem(`peralatan_draft_${item.id_pengajuan}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Konfirmasi Peralatan</h2>
            <p className="text-sm text-gray-500">ID: {item.id_pengajuan}</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100 shrink-0">
            <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase">Nama Peralatan</p>
                <p className="font-medium text-gray-900">{item.nama_peralatan}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase">ID Peralatan</p>
                <p className="font-medium text-gray-900 font-mono">{item.id_peralatan}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-teal-600 uppercase">Spesifikasi</p>
                <p className="font-medium text-gray-900 text-sm">{item.spesifikasi}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase">Qty Pengajuan</p>
                <p className="font-medium text-gray-900">{item.qty}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase">Outlet</p>
                <p className="font-medium text-gray-900">{item.outlet}</p>
              </div>
            </div>
          </div>

          <form id="confirmForm" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah Diterima <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                value={jumlahDiterima}
                onChange={(e) => setJumlahDiterima(e.target.value)}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan (opsional)</label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                rows={3}
                placeholder="Catatan terkait peralatan yang diterima..."
              />
            </div>

            <FileUpload label="Foto Dokumentasi Penerimaan" onFileSelect={setFotoFile} required />
            <FileUpload label="Foto Dokumentasi Nota" onFileSelect={setFotoNotaFile} required />
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all" disabled={isSubmitting}>Batal</button>
          <button type="submit" form="confirmForm" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</>) : (<><CheckCircle className="w-4 h-4" />Kirim Konfirmasi</>)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PeralatanConfirmModal
