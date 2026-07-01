import { LineItem, POWebhookPayload, FlatPOPayload } from '../types'
import { WEBHOOK_INPUT_PO_V3 } from '../config'

const INPUT_WEBHOOK_URL = WEBHOOK_INPUT_PO_V3

export function buildConfirmBody(date: string, cabang: string, items: LineItem[]): POWebhookPayload {
  const headerSupplier = items[0]?.supplier || ''
  const headerPhone = items[0]?.phone || ''
  const waNumber = (headerPhone || '').replace(/[^0-9]/g, '')
  const grandTotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0)
  return {
    version: 'v2',
    'Tanggal PO': date,
    Outlet: cabang,
    'Nama Supplier': headerSupplier || '',
    'Nomor WhatsApp': waNumber || '',
    'Grand Total': grandTotal,
    Status: 'Submitted',
    Items: items.map(it => ({
      'ID BARANG': it.id || '',
      'Nama Barang': it.name,
      SATUAN: it.unit,
      JUMLAH: it.quantity,
      Harga: it.price || 0,
      Subtotal: (it.price || 0) * (it.quantity || 0),
    })),
  }
}

export function buildFlatPOBody(date: string, cabang: string, item: LineItem): FlatPOPayload {
  const phone = item.phone || ''
  const waNumber = phone.replace(/[^0-9]/g, '')
  return {
    version: 'v2',
    'Tanggal PO': date,
    Outlet: cabang,
    'Nama Supplier': item.supplier || '',
    'Nomor WhatsApp': waNumber || '',
    'ID BARANG': item.id || '',
    'Nama Barang': item.name,
    SATUAN: item.unit,
    JUMLAH: item.quantity,
    Harga: item.price || 0,
    Subtotal: (item.price || 0) * (item.quantity || 0),
    Status: 'Submitted'
  }
}

export async function submitPO(body: POWebhookPayload): Promise<Response> {
  return fetch(INPUT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function submitBulkPO(payloads: FlatPOPayload[]): Promise<Response> {
  return fetch(INPUT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ data: payloads }),
  })
}


// --- SPV PO Services ---
import { SPV_ENDPOINTS } from '../config'
import { POItem, ConfirmData, ScanResult } from '../types'
import { normalizePOList } from '../utils/normalizePO'

export const fetchPOList = async (outlet?: string): Promise<POItem[]> => {
  try {
    const url = new URL(SPV_ENDPOINTS.GET_PO_LIST)
    if (outlet) {
      url.searchParams.append('outlet', outlet)
    }
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch PO list: ${response.status} ${response.statusText}`)
    }
    const raw = await response.json()
    const normalized: POItem[] = normalizePOList(raw)
    return normalized
  } catch (error) {
    console.warn('API Error (fetchPOList):', error)
    throw error
  }
}

export const scanNota = async (file: File): Promise<ScanResult> => {
  try {
    const formData = new FormData()
    formData.append('nota', file, file.name)

    const response = await fetch(SPV_ENDPOINTS.SCAN_NOTA, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to scan nota: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      return data as ScanResult
    }
    return [data] as ScanResult
  } catch (error) {
    console.warn('Error scanning nota:', error)
    throw error
  }
}

export const confirmPO = async (data: ConfirmData): Promise<void> => {
  try {
    const formData = new FormData()
    formData.append('id_transaksi', data.id_transaksi)
    formData.append('nama_barang', data.nama_barang)
    formData.append('jumlah_po', String(data.jumlah_po))
    formData.append('jumlah_barang_nota', String(data.jumlah_barang_nota))
    formData.append('satuan_nota', data.satuan_nota)
    formData.append('jumlah_diterima', String(data.jumlah_diterima))
    formData.append('satuan', data.satuan)
    formData.append('supplier', data.supplier)
    formData.append('id_barang', data.id_barang)
    formData.append('jenis', data.jenis || '')
    formData.append('outlet', data.outlet)
    formData.append('nomor_invoice', data.nomor_invoice)
    formData.append('tanggal_konfirmasi', data.tanggal_konfirmasi)
    formData.append('status', data.jumlah_barang_nota >= data.jumlah_po ? 'DITERIMA' : 'KURANG')
    if (data.foto_nota) formData.append('foto_nota', data.foto_nota, data.foto_nota.name)
    if (data.foto_barang) formData.append('foto_barang', data.foto_barang, data.foto_barang.name)
    formData.append('produk_free', String(typeof data.produk_free === 'number' ? data.produk_free : 0))
    if (data.produk_free_satuan) formData.append('produk_free_satuan', data.produk_free_satuan)

    formData.append('harga_satuan', String(data.harga_satuan ?? 0))
    formData.append('total_harga', String(data.total_harga ?? 0))
    formData.append('diskon1', String(data.diskon1 ?? 0))
    formData.append('diskon2', String(data.diskon2 ?? 0))
    formData.append('diskon3', String(data.diskon3 ?? 0))
    formData.append('diskon4', String(data.diskon4 ?? 0))
    formData.append('pajak', String(data.pajak ?? 0))
    formData.append('grand_total', String(data.grand_total ?? 0))
    formData.append('nama_barang_nota', data.nama_barang_nota || '')

    const response = await fetch(SPV_ENDPOINTS.CONFIRM_PO, { method: 'POST', body: formData })
    if (!response.ok) {
      throw new Error(`Failed to submit confirmation: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.warn('Error confirming PO:', error)
    throw error
  }
}
