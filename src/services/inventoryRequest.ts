import { LineItem } from '../types'
import { WEBHOOK_INPUT_INVENTORY_REQUEST } from '../config'

const INPUT_WEBHOOK_URL = WEBHOOK_INPUT_INVENTORY_REQUEST

export type InventoryRequestPayload = {
  version: string
  'Tanggal Pengajuan': string
  'Nama Supplier': string
  'Nomor Invoice': string
  Catatan: string
  Status: string
  Items: Array<{
    'ID Peralatan': string
    'Nama Peralatan': string
    'Satuan Barang': string
    Qty: number
    'Total Estimasi Biaya': number
  }>
}

export function buildInventoryRequestBody(
  date: string,
  supplier: string,
  invoice: string,
  note: string,
  items: LineItem[],
): InventoryRequestPayload {
  const normalizePrice = (value?: number) => Math.max(0, Math.round(Number(value) || 0))

  return {
    version: 'v1',
    'Tanggal Pengajuan': date,
    'Nama Supplier': supplier,
    'Nomor Invoice': invoice,
    Catatan: note,
    Status: 'Submitted',
    Items: items.map(it => ({
      'ID Peralatan': it.id || '',
      'Nama Peralatan': it.name,
      'Satuan Barang': it.unit,
      Qty: it.quantity,
      'Total Estimasi Biaya': normalizePrice(it.price),
    })),
  }
}

export async function submitInventoryRequest(body: InventoryRequestPayload): Promise<Response> {
  return fetch(INPUT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
}
