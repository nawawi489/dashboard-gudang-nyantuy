import { LineItem, InventoryApprovalItem, InventoryApprovalPayload } from '../types'
import { normalizeNumber, normalizeText } from '../utils/format'
import { WEBHOOK_INPUT_PENGAJUAN_PERLENGKAPAN, WEBHOOK_LIST_PERLENGKAPAN, WEBHOOK_LIST_PENGAJUAN_PERLENGKAPAN, WEBHOOK_APPROVE_PENGAJUAN_PERLENGKAPAN } from '../config'

const INPUT_WEBHOOK_URL = WEBHOOK_INPUT_PENGAJUAN_PERLENGKAPAN

export type PerlengkapanRequestPayload = {
  version: string
  'Tanggal Pengajuan': string
  'Nama Supplier': string
  Catatan: string
  Status: string
  Items: Array<{
    'ID Perlengkapan': string
    'Nama Perlengkapan': string
    'Satuan Barang': string
    Qty: number
    'Total Estimasi Biaya': number
  }>
}

export function buildPerlengkapanRequestBody(
  date: string,
  supplier: string,
  note: string,
  items: LineItem[],
): PerlengkapanRequestPayload {
  const normalizePrice = (value?: number) => Math.max(0, Math.round(Number(value) || 0))

  return {
    version: 'v1',
    'Tanggal Pengajuan': date,
    'Nama Supplier': supplier,
    Catatan: note,
    Status: 'Submitted',
    Items: items.map(it => ({
      'ID Perlengkapan': it.id || '',
      'Nama Perlengkapan': it.name,
      'Satuan Barang': it.unit,
      Qty: it.quantity,
      'Total Estimasi Biaya': normalizePrice(it.price),
    })),
  }
}

export async function submitPerlengkapanRequest(body: PerlengkapanRequestPayload): Promise<Response> {
  return fetch(INPUT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
}

function parseStatus(val: unknown): 'Terima' | 'Tolak' | 'Pending' {
  const str = String(val || '').trim().toLowerCase()
  if (str === 'terima' || str === 'true') return 'Terima'
  if (str === 'tolak' || str === 'false') return 'Tolak'
  return 'Pending'
}

function parseBool(val: unknown): boolean {
  if (typeof val === 'boolean') return val
  const str = String(val).toLowerCase().trim()
  return str === 'true' || str === 'yes' || str === '1'
}

export async function fetchBillPerlengkapanItems(
  cabang?: string,
): Promise<InventoryApprovalItem[]> {
  try {
    let url = WEBHOOK_LIST_PERLENGKAPAN
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}outlet=${encodeURIComponent(cabang || '')}`

    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    }

    const text = await res.text()
    if (!text) return []

    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error('Invalid JSON from n8n:', text)
      return []
    }

    const list = Array.isArray(data) ? data : data?.data || data?.items || []

    return list.map((row: any): InventoryApprovalItem => {
      const rowCabang =
        row.outlet || row.Outlet || row.OUTLET ||
        row.cabang || row.Cabang || row.CABANG || 'Toko Tayyibah'
      const itemIdRaw =
        row['ID Perlengkapan'] || row['Id Perlengkapan'] ||
        row['id perlengkapan'] || row.idPerlengkapan ||
        row['ID Peralatan'] || row['Id Peralatan'] ||
        row.itemId || ''
      const trxIdRaw =
        row['ID Pengajuan'] || row['Id Pengajuan'] ||
        row['id pengajuan'] || row.idPengajuan ||
        row.trxId || ''
      const supplierRaw =
        row['Nama Supplier'] || row['nama supplier'] ||
        row.namaSupplier || row.supplier || ''

      return {
        trxId: normalizeText(trxIdRaw || `ROW-${row.row_number ?? Math.random().toString(36).slice(2, 8)}`),
        date: normalizeText(row['Tanggal Pengajuan'] || row['tanggal pengajuan'] || row.date || ''),
        tanggalTerima: normalizeText(row['Tanggal Terima'] || row['tanggal terima'] || ''),
        rowNumber: normalizeNumber(row.row_number) || undefined,
        outlet: normalizeText(rowCabang),
        itemId: normalizeText(itemIdRaw),
        supplier: normalizeText(supplierRaw),
        itemName: normalizeText(
          row['Nama Perlengkapan'] || row['nama perlengkapan'] ||
          row.namaPerlengkapan ||
          row['Nama Peralatan'] || row['nama peralatan'] ||
          row.namaPeralatan || row.itemName || '-',
        ),
        spesifikasi: normalizeText(
          row['Spesifikasi / Tipe'] || row['Spesifikasi/Tipe'] ||
          row['spesifikasi / tipe'] || row.spesifikasi || '',
        ),
        quantity: normalizeNumber(row.Qty ?? row.qty ?? row.quantity ?? 0),
        totalEstimasiBiaya: normalizeNumber(
          row['Total Tagihan'] || row['total tagihan'] ||
          row['Total Estimasi Biaya'] || row['total estimasi biaya'] ||
          row.totalEstimasiBiaya || 0,
        ),
        status: parseStatus(
          row['Status Approval Finance'] || row['status approval finance'] ||
          row.statusApprovalFinance || row.status,
        ),
        tanggalApproval: normalizeText(row['Tanggal Approval'] || row['tanggal approval'] || ''),
        nominalDisetujui: normalizeNumber(
          row['Nominal Disetujui'] || row['nominal disetujui'] || row.nominalDisetujui || 0,
        ) || undefined,
        verifikasiSpv: parseBool(
          row['Verifikasi Admin'] || row['Verifikasi SPV'] || row['verifikasi spv'] || row.verifikasiSpv,
        ),
        buktiDokumentasi: normalizeText(
          row['Bukti Dokumentasi Penerimaan'] || row['bukti dokumentasi penerimaan'] ||
          row.buktiDokumentasi || '',
        ),
        verifikasiInputAset: parseBool(
          row['Verifikasi Input Aset'] || row['verifikasi input aset'] || row.verifikasiInputAset,
        ),
        statusPembayaran: normalizeText(row['Status Pembayaran'] || row['status pembayaran'] || row.statusPembayaran || ''),
        nomorInvoice: normalizeText(row['Nomor Invoice'] || row['nomor invoice'] || row.nomorInvoice || ''),
      }
    })
  } catch (e) {
    console.error('Gagal mengambil data tagihan perlengkapan', e)
    throw e
  }
}

export async function fetchPerlengkapanApprovalItems(
  cabang?: string,
): Promise<InventoryApprovalItem[]> {
  try {
    let url = WEBHOOK_LIST_PENGAJUAN_PERLENGKAPAN
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
    } catch {
      console.error('Invalid JSON from n8n:', text)
      return []
    }

    const list = Array.isArray(data) ? data : data?.data || data?.items || []

    return list.map((row: any): InventoryApprovalItem => {
      const rowCabang =
        row.outlet || row.Outlet || row.OUTLET ||
        row.cabang || row.Cabang || row.CABANG || 'Toko Tayyibah'
      const itemIdRaw =
        row['ID Perlengkapan'] || row['Id Perlengkapan'] ||
        row['id perlengkapan'] || row.idPerlengkapan ||
        row['ID Peralatan'] || row['Id Peralatan'] ||
        row.itemId || ''
      const trxIdRaw =
        row['ID Pengajuan'] || row['Id Pengajuan'] ||
        row['id pengajuan'] || row.idPengajuan ||
        row.trxId || ''
      const supplierRaw =
        row['Nama Supplier'] || row['nama supplier'] ||
        row.namaSupplier || row.supplier || ''

      return {
        trxId: normalizeText(trxIdRaw || `ROW-${row.row_number ?? Math.random().toString(36).slice(2, 8)}`),
        date: normalizeText(row['Tanggal Pengajuan'] || row['tanggal pengajuan'] || row.date || ''),
        tanggalTerima: normalizeText(row['Tanggal Terima'] || row['tanggal terima'] || ''),
        rowNumber: normalizeNumber(row.row_number) || undefined,
        outlet: normalizeText(rowCabang),
        itemId: normalizeText(itemIdRaw),
        supplier: normalizeText(supplierRaw),
        itemName: normalizeText(
          row['Nama Perlengkapan'] || row['nama perlengkapan'] ||
          row.namaPerlengkapan ||
          row['Nama Peralatan'] || row['nama peralatan'] ||
          row.namaPeralatan || row.itemName || '-',
        ),
        spesifikasi: normalizeText(
          row['Spesifikasi / Tipe'] || row['Spesifikasi/Tipe'] ||
          row['spesifikasi / tipe'] || row.spesifikasi || '',
        ),
        quantity: normalizeNumber(row.Qty ?? row.qty ?? row.quantity ?? 0),
        totalEstimasiBiaya: normalizeNumber(
          row['Total Estimasi Biaya'] || row['total estimasi biaya'] ||
          row.totalEstimasiBiaya || 0,
        ),
        status: parseStatus(
          row['Status Approval Finance'] || row['status approval finance'] ||
          row.statusApprovalFinance || row.status,
        ),
        tanggalApproval: normalizeText(row['Tanggal Approval'] || row['tanggal approval'] || ''),
        nominalDisetujui: normalizeNumber(
          row['Nominal Disetujui'] || row['nominal disetujui'] || row.nominalDisetujui || 0,
        ) || undefined,
        verifikasiSpv: parseBool(
          row['Verifikasi Admin'] || row['Verifikasi SPV'] || row['verifikasi spv'] || row.verifikasiSpv,
        ),
        buktiDokumentasi: normalizeText(
          row['Bukti Dokumentasi Penerimaan'] || row['bukti dokumentasi penerimaan'] ||
          row.buktiDokumentasi || '',
        ),
        verifikasiInputAset: parseBool(
          row['Verifikasi Input Aset'] || row['verifikasi input aset'] || row.verifikasiInputAset,
        ),
        statusPembayaran: normalizeText(row['Status Pembayaran'] || row['status pembayaran'] || row.statusPembayaran || ''),
        nomorInvoice: normalizeText(row['Nomor Invoice'] || row['nomor invoice'] || row.nomorInvoice || ''),
      }
    })
  } catch (e) {
    console.error('Gagal mengambil data approval perlengkapan', e)
    throw e
  }
}

export async function submitPerlengkapanApproval(
  payload: InventoryApprovalPayload,
): Promise<boolean> {
  const response = await fetch(WEBHOOK_APPROVE_PENGAJUAN_PERLENGKAPAN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return true
}
