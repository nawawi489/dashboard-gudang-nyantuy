import { useState, FormEvent, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Loader2, ScanLine } from 'lucide-react'
import { POItem, ScanResult, ScanItem } from '../../types'
import FileUpload from './FileUpload'
import { scanNota } from '../../services/po'

interface POConfirmModalProps {
  item: POItem
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    jumlahBarangNota: number
    satuan: string
    jumlahDiterima: number
    satuanDiterima: string
    nomorInvoice: string
    notaFile: File | null
    barangFile: File | null
    produkFree?: number
    produkFreeUnit?: string
    hargaSatuan?: number
    totalHarga?: number
    diskon1?: number
    diskon2?: number
    diskon3?: number
    diskon4?: number
    pajak?: number
    grandTotal?: number
    namaBarangNota?: string
  }) => void
}

const defaultScanItem: ScanItem = {
  nomor_invoice: '',
  nama_barang: '',
  jumlah_barang: 0,
  satuan_barang: '',
  harga_satuan: 0,
  total_harga: 0,
  diskon_1: 0,
  diskon_2: 0,
  diskon_3: 0,
  diskon_4: 0,
  qty_free: 0,
  satuan_barang_free: '',
  pajak: 0,
  grand_total: 0
}

const POConfirmModal = ({ item, open, onClose, onSubmit }: POConfirmModalProps) => {
  const [jumlahBarangNota, setJumlahBarangNota] = useState<string>(String(item.jumlah_po))
  const [jumlahDiterima, setJumlahDiterima] = useState<string>(String(item.jumlah_po))
  const [notaFile, setNotaFile] = useState<File | null>(null)
  const [barangFile, setBarangFile] = useState<File | null>(null)
  const [satuan, setSatuan] = useState<string>(item.satuan || '')
  const [satuanDiterima, setSatuanDiterima] = useState<string>(item.satuan || '')
  const [nomorInvoice, setNomorInvoice] = useState<string>('')
  const [produkFree, setProdukFree] = useState<string>('')
  const [produkFreeUnit, setProdukFreeUnit] = useState<string>('')

  const [scanResult, setScanResult] = useState<ScanResult>([defaultScanItem])
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanSuccess, setScanSuccess] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const savedData = localStorage.getItem(`po_draft_${item.id_transaksi}`)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          if (parsed.scanResult && Array.isArray(parsed.scanResult) && parsed.scanResult.length > 0) {
            setScanResult(parsed.scanResult)
          }
          if (parsed.jumlahBarangNota) setJumlahBarangNota(parsed.jumlahBarangNota)
          if (parsed.jumlahDiterima) setJumlahDiterima(parsed.jumlahDiterima)
          if (parsed.satuan) setSatuan(parsed.satuan)
          if (parsed.satuanDiterima) setSatuanDiterima(parsed.satuanDiterima)
          if (parsed.nomorInvoice) setNomorInvoice(parsed.nomorInvoice)
          if (parsed.produkFree) setProdukFree(parsed.produkFree)
          if (parsed.produkFreeUnit) setProdukFreeUnit(parsed.produkFreeUnit)
          if (parsed.showDetails) setShowDetails(parsed.showDetails)
        } catch (e) {
          console.error('Failed to restore draft', e)
        }
      }
      setIsLoaded(true)
    }
  }, [open, item.id_transaksi])

  useEffect(() => {
    if (open && isLoaded && (scanResult || nomorInvoice || jumlahBarangNota !== String(item.jumlah_po))) {
      const draft = {
        scanResult,
        jumlahBarangNota,
        jumlahDiterima,
        satuan,
        satuanDiterima,
        nomorInvoice,
        produkFree,
        produkFreeUnit,
        showDetails
      }
      localStorage.setItem(`po_draft_${item.id_transaksi}`, JSON.stringify(draft))
    }
  }, [open, isLoaded, scanResult, jumlahBarangNota, jumlahDiterima, satuan, satuanDiterima, nomorInvoice, produkFree, produkFreeUnit, showDetails, item.id_transaksi, item.jumlah_po])

  if (!open) return null

  const handleScanNota = async () => {
    if (!notaFile) {
      setScanError('Silakan upload foto nota terlebih dahulu.')
      return
    }
    setScanError(null)
    setScanSuccess(null)
    setIsScanning(true)
    try {
      const result = await scanNota(notaFile)

      if (result && result.length > 0) {
        setScanResult(result)
        setScanSuccess('Scan nota berhasil!')

        const firstItem = result[0]
        if (firstItem.nomor_invoice) setNomorInvoice(firstItem.nomor_invoice)
        if (firstItem.jumlah_barang) setJumlahBarangNota(String(firstItem.jumlah_barang))
        if (firstItem.satuan_barang) setSatuan(firstItem.satuan_barang)
        if (firstItem.qty_free) setProdukFree(String(firstItem.qty_free))
        if (firstItem.satuan_barang_free) setProdukFreeUnit(firstItem.satuan_barang_free)
      } else {
        setScanResult([defaultScanItem])
        setScanError('Scan selesai namun tidak ada item ditemukan. Silakan input manual.')
      }
    } catch (e) {
      setScanError('Gagal memindai nota. Silakan coba lagi atau input manual.')
      setScanResult([{
        ...defaultScanItem,
        nama_barang: item.nama_barang,
        jumlah_barang: item.jumlah_po,
        satuan_barang: item.satuan || ''
      }])
    } finally {
      setIsScanning(false)
      setShowDetails(true)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!jumlahBarangNota || parseInt(jumlahBarangNota) < 0) { setError('Jumlah barang di nota tidak valid.'); return }
    if (produkFree && parseInt(produkFree) < 0) { setError('Produk free tidak boleh negatif.'); return }
    if (!satuan || !satuan.trim()) { setError('Satuan barang wajib diisi.'); return }
    if (!nomorInvoice || !nomorInvoice.trim()) { setError('Nomor invoice wajib diisi.'); return }
    if (!notaFile) { setError('Foto Nota wajib diupload.'); return }
    if (!barangFile) { setError('Foto Barang wajib diupload.'); return }

    if (scanResult && scanResult.length > 0) {
      const firstItem = scanResult[0]
      if (!firstItem.grand_total || firstItem.grand_total <= 0) {
        setError('Grand total hasil scan harus lebih dari 0.')
        return
      }

      for (const scanItem of scanResult) {
        if (!scanItem.nama_barang || !scanItem.nama_barang.trim()) {
          setError('Nama barang hasil scan tidak boleh kosong.')
          return
        }
        if (!scanItem.harga_satuan || scanItem.harga_satuan <= 0) {
          setError('Harga satuan hasil scan harus lebih dari 0.')
          return
        }
        if (!scanItem.total_harga || scanItem.total_harga <= 0) {
          setError('Total harga hasil scan harus lebih dari 0.')
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const firstItem = scanResult && scanResult.length > 0 ? scanResult[0] : undefined
      await onSubmit({
        jumlahBarangNota: parseInt(jumlahBarangNota),
        satuan,
        jumlahDiterima: parseInt(jumlahDiterima),
        satuanDiterima,
        nomorInvoice,
        notaFile,
        barangFile,
        produkFree: produkFree ? parseInt(produkFree) : 0,
        produkFreeUnit: produkFreeUnit || undefined,
        hargaSatuan: firstItem?.harga_satuan ?? 0,
        totalHarga: firstItem?.total_harga ?? 0,
        diskon1: firstItem?.diskon_1 ?? 0,
        diskon2: firstItem?.diskon_2 ?? 0,
        diskon3: firstItem?.diskon_3 ?? 0,
        diskon4: firstItem?.diskon_4 ?? 0,
        pajak: firstItem?.pajak ?? 0,
        grandTotal: firstItem?.grand_total ?? 0,
        namaBarangNota: firstItem?.nama_barang || '',
      })
      localStorage.removeItem(`po_draft_${item.id_transaksi}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Konfirmasi Barang</h2>
            <p className="text-sm text-gray-500">ID: {item.id_transaksi}</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="px-4 sm:px-6 py-3 bg-red-50 border-b border-red-100 shrink-0">
            <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Nama Barang</p>
              <p className="font-medium text-gray-900">{item.nama_barang}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Supplier</p>
              <p className="font-medium text-gray-900">{item.supplier}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Jumlah PO</p>
              <p className="font-medium text-gray-900">{item.jumlah_po}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Outlet</p>
              <p className="font-medium text-gray-900">{item.outlet}</p>
            </div>
          </div>

          <form id="confirmForm" onSubmit={handleSubmit} className="space-y-6">

            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ScanLine size={18} className="text-blue-600" />
                Scan Nota Otomatis
              </h3>

              <FileUpload label="Foto Nota (Upload dahulu untuk scan)" onFileSelect={setNotaFile} required />

              {notaFile && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleScanNota}
                    disabled={isScanning}
                    className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                  >
                    {isScanning ? (
                      <><Loader2 size={18} className="animate-spin" /> Sedang Memindai...</>
                    ) : (
                      <><ScanLine size={18} /> Scan Nota Sekarang</>
                    )}
                  </button>
                  {scanError && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {scanError}</p>}
                  {scanSuccess && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle size={14} /> {scanSuccess}</p>}
                </div>
              )}
            </div>

            {showDetails && (
            <div className={`p-5 rounded-xl border space-y-5 transition-all duration-300 ${scanResult ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
               <div className="flex items-center gap-2 pb-2 border-b border-gray-200/50">
                  <span className={`w-2.5 h-2.5 rounded-full ${scanResult ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                  <h4 className={`text-base font-bold ${scanResult ? 'text-yellow-900' : 'text-gray-800'}`}>
                    Detail Konfirmasi PO
                  </h4>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <div>
                   <label className={`block text-sm font-semibold mb-1.5 ${scanResult ? 'text-yellow-900' : 'text-gray-700'}`}>Jumlah Diterima</label>
                   <input
                      type="number"
                      min="0"
                      value={jumlahDiterima}
                      onChange={(e) => setJumlahDiterima(e.target.value)}
                      className={`w-full px-4 py-2 bg-white text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${scanResult ? 'border-yellow-300 focus:border-yellow-500' : 'border-gray-300 focus:border-blue-500'}`}
                      required
                   />
                 </div>
                 <div>
                   <label className={`block text-sm font-semibold mb-1.5 ${scanResult ? 'text-yellow-900' : 'text-gray-700'}`}>Satuan</label>
                   <input
                      type="text"
                      value={satuanDiterima}
                      onChange={(e) => setSatuanDiterima(e.target.value)}
                      className={`w-full px-4 py-2 bg-white text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${scanResult ? 'border-yellow-300 focus:border-yellow-500' : 'border-gray-300 focus:border-blue-500'}`}
                      required
                   />
                 </div>
               </div>

               <div>
                 <label className={`block text-sm font-semibold mb-1.5 ${scanResult ? 'text-yellow-900' : 'text-gray-700'}`}>Nomor Invoice <span className="text-red-500">*</span></label>
                 <input
                    type="text"
                    value={nomorInvoice}
                    onChange={(e) => setNomorInvoice(e.target.value)}
                    className={`w-full px-4 py-2 bg-white text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${scanResult ? 'border-yellow-300 focus:border-yellow-500' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="Contoh: INV-2025-001"
                    required
                 />
               </div>

               <div className="pt-4 border-t border-yellow-200/60 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">Rincian Harga (Wajib Diisi)</p>

                    {Array.isArray(scanResult) && scanResult.map((scanItem, idx) => (
                      <div key={idx} className={idx > 0 ? 'mt-4 pt-4 border-t border-yellow-100' : ''}>
                        {scanResult.length > 1 && <p className="text-xs font-semibold text-yellow-800 mb-2">Item #{idx + 1}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nama Barang Scan <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={scanItem.nama_barang || ''}
                              onChange={(e) => {
                                const newItems = [...scanResult]
                                newItems[idx] = { ...newItems[idx], nama_barang: e.target.value }
                                setScanResult(newItems)
                              }}
                              className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                              required
                            />
                          </div>

                          {idx === 0 && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                               <div>
                                 <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Barang di Nota <span className="text-red-500">*</span></label>
                                 <input
                                    type="number"
                                    min="0"
                                    value={jumlahBarangNota}
                                    onChange={(e) => setJumlahBarangNota(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                                    required
                                 />
                               </div>
                               <div>
                                 <label className="block text-xs font-medium text-gray-600 mb-1">Satuan Barang di Nota <span className="text-red-500">*</span></label>
                                 <input
                                    type="text"
                                    value={satuan}
                                    onChange={(e) => setSatuan(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                                    placeholder="Contoh: Karton, Pcs"
                                    required
                                 />
                               </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Harga Satuan <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              value={scanItem.harga_satuan}
                              onChange={(e) => {
                                const newItems = [...scanResult]
                                newItems[idx] = { ...newItems[idx], harga_satuan: parseFloat(e.target.value) || 0 }
                                setScanResult(newItems)
                              }}
                              className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                              required
                              min="0"
                              step="any"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Total Harga <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              value={scanItem.total_harga}
                              onChange={(e) => {
                                const newItems = [...scanResult]
                                newItems[idx] = { ...newItems[idx], total_harga: parseFloat(e.target.value) || 0 }
                                setScanResult(newItems)
                              }}
                              className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                              required
                              min="0"
                              step="any"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Diskon 1</label>
                            <input
                              type="number"
                              value={scanItem.diskon_1 || 0}
                              onChange={(e) => {
                                const newItems = [...scanResult]
                                newItems[idx] = { ...newItems[idx], diskon_1: parseFloat(e.target.value) || 0 }
                                setScanResult(newItems)
                              }}
                              className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                              step="any"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Diskon 2</label>
                            <input
                              type="number"
                              value={scanItem.diskon_2 || 0}
                              onChange={(e) => {
                                const newItems = [...scanResult]
                                newItems[idx] = { ...newItems[idx], diskon_2: parseFloat(e.target.value) || 0 }
                                setScanResult(newItems)
                              }}
                              className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                              step="any"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Diskon 3</label>
                            <input
                              type="number"
                              value={scanItem.diskon_3 || 0}
                              onChange={(e) => {
                                const newItems = [...scanResult]
                                newItems[idx] = { ...newItems[idx], diskon_3: parseFloat(e.target.value) || 0 }
                                setScanResult(newItems)
                              }}
                              className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                              step="any"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Diskon 4</label>
                            <input
                              type="number"
                              value={scanItem.diskon_4 || 0}
                              onChange={(e) => {
                                const newItems = [...scanResult]
                                newItems[idx] = { ...newItems[idx], diskon_4: parseFloat(e.target.value) || 0 }
                                setScanResult(newItems)
                              }}
                              className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                              step="any"
                            />
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-2 border-t border-yellow-200/60 pt-2 mt-2"></div>

                   <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pajak <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={scanResult && scanResult.length > 0 ? scanResult[0].pajak : 0}
                      onChange={(e) => {
                        if (scanResult) {
                          const newItems = scanResult.map(scanItem => ({...scanItem, pajak: parseFloat(e.target.value) || 0}))
                          setScanResult(newItems)
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                      required
                      min="0"
                      step="any"
                    />
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Grand Total <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={scanResult && scanResult.length > 0 ? scanResult[0].grand_total : 0}
                      onChange={(e) => {
                        if (scanResult) {
                          const newItems = scanResult.map(scanItem => ({...scanItem, grand_total: parseFloat(e.target.value) || 0}))
                          setScanResult(newItems)
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-white text-sm border border-yellow-300 rounded-md focus:border-yellow-500 outline-none"
                      required
                      min="1"
                      step="any"
                    />
                  </div>
               </div>

               <div>
                 <label className={`block text-sm font-semibold mb-1.5 ${scanResult ? 'text-yellow-900' : 'text-gray-700'}`}>Produk Free (opsional)</label>
                 <div className="flex items-center">
                   <input
                     type="number"
                     min="0"
                     value={produkFree}
                     onChange={(e) => setProdukFree(e.target.value)}
                     className={`flex-1 px-4 py-2 bg-white text-gray-900 border rounded-l-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${scanResult ? 'border-yellow-300 focus:border-yellow-500' : 'border-gray-300 focus:border-blue-500'}`}
                     placeholder="input produk free jika ada"
                   />
                   <select
                     value={produkFreeUnit}
                     onChange={(e) => setProdukFreeUnit(e.target.value)}
                     className={`px-3 h-[42px] bg-white text-gray-900 border border-l-0 rounded-r-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${scanResult ? 'border-yellow-300 focus:border-yellow-500' : 'border-gray-300 focus:border-blue-500'}`}
                   >
                     <option value="">Satuan</option>
                     <option value="Pcs">Pcs</option>
                     <option value="Pack">Pack</option>
                     <option value="Kg">Kg</option>
                     <option value="Liter">Liter</option>
                     <option value="Zak">Zak</option>
                   </select>
                 </div>
               </div>
            </div>
            )}

            <FileUpload label="Foto Barang" onFileSelect={setBarangFile} required />
          </form>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all" disabled={isSubmitting}>Batal</button>
          <button type="submit" form="confirmForm" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</>) : (<><CheckCircle className="w-4 h-4" />Kirim Konfirmasi</>)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default POConfirmModal
