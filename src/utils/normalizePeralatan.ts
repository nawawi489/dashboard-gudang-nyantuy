import { PeralatanItem } from '../types'

export const normalizePeralatanList = (raw: any): PeralatanItem[] => {
  const arr = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.data) ? raw.data : [])
  return (arr as any[])
    .filter(item => {
      const statusOk = String(item['Status Approval Finance'] || '').toLowerCase() === 'terima'
      const v = item['Verifikasi SPV']
      const s = String(v).toLowerCase()
      const verifFalse = v === false || s === 'false' || v === 0 || s === '0'
      return statusOk && verifFalse
    })
    .map(item => ({
      id_pengajuan: String(item['ID Pengajuan'] || ''),
      id_peralatan: String(item['ID Peralatan'] || ''),
      nama_peralatan: String(item['Nama Peralatan'] || ''),
      spesifikasi: String(item['Spesifikasi / Tipe'] || ''),
      outlet: String(item['Outlet'] || ''),
      qty: Number(item['Qty'] ?? 0),
      total_estimasi_biaya: Number(item['Total Estimasi Biaya'] ?? 0),
      tanggal_pengajuan: String(item['Tanggal Pengajuan'] || ''),
      status_approval_finance: String(item['Status Approval Finance'] || ''),
      tanggal_approval: String(item['Tanggal Approval'] || ''),
      catatan: String(item['Catatan'] || ''),
      verifikasi_spv: item['Verifikasi SPV'] === true || String(item['Verifikasi SPV']).toLowerCase() === 'true',
      bukti_dokumentasi: String(item['Bukti Dokumentasi Penerimaan'] || ''),
      verifikasi_input_aset: item['Verifikasi Input Aset'] === true || String(item['Verifikasi Input Aset']).toLowerCase() === 'true',
    }))
}
