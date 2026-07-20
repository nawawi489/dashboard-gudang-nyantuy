import { PeralatanItem } from '../types'

export const normalizePeralatanList = (raw: any): PeralatanItem[] => {
  const arr = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.data) ? raw.data : [])
  return (arr as any[])
    .filter(item => {
      const statusApproval = String(item['Status Approval Finance'] ?? '').trim().toLowerCase()
      const rawVerifikasi = item['Verifikasi SPV'] ?? item['Verifikasi Admin']
      const verifikasi = String(rawVerifikasi ?? '').trim().toLowerCase()
      const statusOk = statusApproval === 'terima'
      const verifFalse =
        rawVerifikasi == null ||
        verifikasi === '' ||
        rawVerifikasi === false ||
        verifikasi === 'false' ||
        rawVerifikasi === 0 ||
        verifikasi === '0'
      return statusOk && verifFalse
    })
    .map(item => ({
      id_pengajuan: String(item['ID Pengajuan'] || ''),
      id_peralatan: String(item['ID Peralatan'] || item['ID Perlengkapan'] || ''),
      nama_peralatan: String(item['Nama Peralatan'] || item['Nama Perlengkapan'] || ''),
      supplier: String(item['Nama Supplier'] || item['nama supplier'] || ''),
      spesifikasi: String(item['Spesifikasi / Tipe'] || ''),
      outlet: String(item['Outlet'] || item['outlet'] || 'Toko Tayyibah'),
      qty: Number(item['Qty'] ?? 0),
      total_estimasi_biaya: Number(item['Total Estimasi Biaya'] ?? 0),
      tanggal_pengajuan: String(item['Tanggal Pengajuan'] || ''),
      status_approval_finance: String(item['Status Approval Finance'] || ''),
      tanggal_approval: String(item['Tanggal Approval'] || ''),
      catatan: String(item['Catatan'] || ''),
      verifikasi_spv: item['Verifikasi SPV'] === true || item['Verifikasi Admin'] === true || String(item['Verifikasi SPV'] ?? item['Verifikasi Admin'] ?? '').trim().toLowerCase() === 'true',
      bukti_dokumentasi: String(item['Bukti Dokumentasi Penerimaan'] || ''),
      verifikasi_input_aset: item['Verifikasi Input Aset'] === true || String(item['Verifikasi Input Aset'] ?? '').trim().toLowerCase() === 'true',
    }))
}
