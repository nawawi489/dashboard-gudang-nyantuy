import { normalizeNumber, normalizeText } from '../utils/format'
import {
  WEBHOOK_APPROVE_PENGAJUAN_PERALATAN,
  WEBHOOK_LIST_PENGAJUAN_PERALATAN,
  WEBHOOK_LIST_INVENTARIS,
} from '../config'
import {
  InventoryApprovalItem,
  InventoryApprovalPayload,
  InventoryApprovalStatus,
} from '../types'

export { type InventoryApprovalItem, type InventoryApprovalPayload, type InventoryApprovalStatus }

function parseStatus(val: unknown): InventoryApprovalStatus {
  const str = String(val || '').trim()
  const lower = str.toLowerCase()
  if (lower === 'terima' || lower === 'true') return 'Terima'
  if (lower === 'tolak' || lower === 'false') return 'Tolak'
  if (lower === 'pending') return 'Pending'
  return 'Pending'
}

function parseBool(val: unknown): boolean {
  if (typeof val === 'boolean') return val
  const str = String(val).toLowerCase().trim()
  return str === 'true' || str === 'yes' || str === '1'
}

export async function fetchInventoryApprovalItems(
  cabang?: string,
): Promise<InventoryApprovalItem[]> {
  try {
    let url = WEBHOOK_LIST_PENGAJUAN_PERALATAN
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}outlet=${encodeURIComponent(cabang || '')}`

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    }

    const text = await res.text()
    if (!text) return []

    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('Invalid JSON from n8n:', text)
      return []
    }

    const list = Array.isArray(data) ? data : data?.data || data?.items || []

    return list.map((row: any): InventoryApprovalItem => {
      const rowCabang =
        row.outlet ||
        row.Outlet ||
        row.OUTLET ||
        row.cabang ||
        row.Cabang ||
        row.CABANG ||
        '-'
      const itemIdRaw =
        row['ID Peralatan'] ||
        row['Id Peralatan'] ||
        row['id peralatan'] ||
        row.idPeralatan ||
        row.itemId ||
        ''
      const trxIdRaw =
        row['ID Pengajuan'] ||
        row['Id Pengajuan'] ||
        row['id pengajuan'] ||
        row.idPengajuan ||
        row.trxId ||
        ''

      return {
        trxId: normalizeText(trxIdRaw || `ROW-${row.row_number ?? Math.random().toString(36).slice(2, 8)}`),
        date: normalizeText(row['Tanggal Pengajuan'] || row['tanggal pengajuan'] || row.date || ''),
        tanggalTerima: normalizeText(row['Tanggal Terima'] || row['tanggal terima'] || ''),
        rowNumber: normalizeNumber(row.row_number) || undefined,
        outlet: normalizeText(rowCabang),
        itemId: normalizeText(itemIdRaw),
        itemName: normalizeText(
          row['Nama Peralatan'] ||
            row['nama peralatan'] ||
            row.namaPeralatan ||
            row.itemName ||
            '-',
        ),
        spesifikasi: normalizeText(
          row['Spesifikasi / Tipe'] ||
            row['Spesifikasi/Tipe'] ||
            row['spesifikasi / tipe'] ||
            row.spesifikasi ||
            '',
        ),
        quantity: normalizeNumber(row.Qty ?? row.qty ?? row.quantity ?? 0),
        totalEstimasiBiaya: normalizeNumber(
          row['Total Estimasi Biaya'] ||
            row['total estimasi biaya'] ||
            row.totalEstimasiBiaya ||
            0,
        ),
        status: parseStatus(
          row['Status Approval Finance'] ||
            row['status approval finance'] ||
            row.statusApprovalFinance ||
            row.status,
        ),
        tanggalApproval: normalizeText(row['Tanggal Approval'] || row['tanggal approval'] || ''),
        nominalDisetujui: normalizeNumber(
          row['Nominal Disetujui'] || row['nominal disetujui'] || row.nominalDisetujui || 0,
        ) || undefined,
        verifikasiSpv: parseBool(
          row['Verifikasi SPV'] || row['verifikasi spv'] || row.verifikasiSpv,
        ),
        buktiDokumentasi: normalizeText(
          row['Bukti Dokumentasi Penerimaan'] ||
            row['bukti dokumentasi penerimaan'] ||
            row.buktiDokumentasi ||
            '',
        ),
        verifikasiInputAset: parseBool(
          row['Verifikasi Input Aset'] ||
            row['verifikasi input aset'] ||
            row.verifikasiInputAset,
        ),
        statusPembayaran: normalizeText(row['Status Pembayaran'] || row['status pembayaran'] || row.statusPembayaran || ''),
        nomorInvoice: normalizeText(row['Nomor Invoice'] || row['nomor invoice'] || row.nomorInvoice || ''),
      }
    })
  } catch (e) {
    console.error('Gagal mengambil data approval inventaris', e)
    throw e
  }
}

export async function fetchBillInventoryItems(
  cabang?: string,
): Promise<InventoryApprovalItem[]> {
  try {
    let url = WEBHOOK_LIST_INVENTARIS
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}outlet=${encodeURIComponent(cabang || '')}`

    const res = await fetch(url, {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    }

    const text = await res.text()
    if (!text) return []

    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('Invalid JSON from n8n:', text)
      return []
    }

    const list = Array.isArray(data) ? data : data?.data || data?.items || []

    return list.map((row: any): InventoryApprovalItem => {
      const rowCabang =
        row.outlet ||
        row.Outlet ||
        row.OUTLET ||
        row.cabang ||
        row.Cabang ||
        row.CABANG ||
        '-'
      const itemIdRaw =
        row['ID Peralatan'] ||
        row['Id Peralatan'] ||
        row['id peralatan'] ||
        row.idPeralatan ||
        row.itemId ||
        ''
      const trxIdRaw =
        row['ID Pengajuan'] ||
        row['Id Pengajuan'] ||
        row['id pengajuan'] ||
        row.idPengajuan ||
        row.trxId ||
        ''

      return {
        trxId: normalizeText(trxIdRaw || `ROW-${row.row_number ?? Math.random().toString(36).slice(2, 8)}`),
        date: normalizeText(row['Tanggal Pengajuan'] || row['tanggal pengajuan'] || row.date || ''),
        tanggalTerima: normalizeText(row['Tanggal Terima'] || row['tanggal terima'] || ''),
        rowNumber: normalizeNumber(row.row_number) || undefined,
        outlet: normalizeText(rowCabang),
        itemId: normalizeText(itemIdRaw),
        itemName: normalizeText(
          row['Nama Peralatan'] ||
            row['nama peralatan'] ||
            row.namaPeralatan ||
            row.itemName ||
            '-',
        ),
        spesifikasi: normalizeText(
          row['Spesifikasi / Tipe'] ||
            row['Spesifikasi/Tipe'] ||
            row['spesifikasi / tipe'] ||
            row.spesifikasi ||
            '',
        ),
        quantity: normalizeNumber(row.Qty ?? row.qty ?? row.quantity ?? 0),
        totalEstimasiBiaya: normalizeNumber(
          row['Total Estimasi Biaya'] ||
            row['total estimasi biaya'] ||
            row.totalEstimasiBiaya ||
            0,
        ),
        status: parseStatus(
          row['Status Approval Finance'] ||
            row['status approval finance'] ||
            row.statusApprovalFinance ||
            row.status,
        ),
        tanggalApproval: normalizeText(row['Tanggal Approval'] || row['tanggal approval'] || ''),
        nominalDisetujui: normalizeNumber(
          row['Nominal Disetujui'] || row['nominal disetujui'] || row.nominalDisetujui || 0,
        ) || undefined,
        verifikasiSpv: parseBool(
          row['Verifikasi Admin'] || row['Verifikasi SPV'] || row['verifikasi spv'] || row.verifikasiSpv,
        ),
        buktiDokumentasi: normalizeText(
          row['Bukti Dokumentasi Penerimaan'] ||
            row['bukti dokumentasi penerimaan'] ||
            row.buktiDokumentasi ||
            '',
        ),
        verifikasiInputAset: parseBool(
          row['Verifikasi Input Aset'] ||
            row['verifikasi input aset'] ||
            row.verifikasiInputAset,
        ),
        statusPembayaran: normalizeText(row['Status Pembayaran'] || row['status pembayaran'] || row.statusPembayaran || ''),
        nomorInvoice: normalizeText(row['Nomor Invoice'] || row['nomor invoice'] || row.nomorInvoice || ''),
      }
    })
  } catch (e) {
    console.error('Gagal mengambil data tagihan inventaris', e)
    throw e
  }
}

export async function submitInventoryApproval(
  payload: InventoryApprovalPayload,
): Promise<boolean> {
  const response = await fetch(WEBHOOK_APPROVE_PENGAJUAN_PERALATAN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return true
}
