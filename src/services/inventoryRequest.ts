import { LineItem } from '../types'
import { WEBHOOK_INPUT_INVENTORY_REQUEST } from '../config'

const INPUT_WEBHOOK_URL = WEBHOOK_INPUT_INVENTORY_REQUEST

export type InventoryRequestPayload = {
  version: string
  'Tanggal Permintaan': string
  Outlet: string
  Keterangan: string
  Status: string
  Items: Array<{
    'ID BARANG': string
    'Nama Barang': string
    SATUAN: string
    JUMLAH: number
    Merk: string
    'Spesifikasi/Tipe': string
    Harga: number
    Subtotal: number
  }>
}

export function buildInventoryRequestBody(
  date: string,
  cabang: string,
  note: string,
  items: LineItem[],
): InventoryRequestPayload {
  return {
    version: 'v1',
    'Tanggal Permintaan': date,
    Outlet: cabang,
    Keterangan: note,
    Status: 'Submitted',
    Items: items.map(it => {
      const harga = it.price || 0
      return {
        'ID BARANG': it.id || '',
        'Nama Barang': it.name,
        SATUAN: it.unit,
        JUMLAH: it.quantity,
        Merk: it.brand || '',
        'Spesifikasi/Tipe': it.specification || '',
        Harga: harga,
        Subtotal: harga * it.quantity,
      }
    }),
  }
}

export async function submitInventoryRequest(body: InventoryRequestPayload): Promise<Response> {
  return fetch(INPUT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
}
