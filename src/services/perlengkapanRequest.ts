import { LineItem } from '../types'
import { WEBHOOK_INPUT_PENGAJUAN_PERLENGKAPAN } from '../config'

const INPUT_WEBHOOK_URL = WEBHOOK_INPUT_PENGAJUAN_PERLENGKAPAN

export type PerlengkapanRequestPayload = {
  version: string
  'Tanggal Permintaan': string
  Outlet: string
  Status: string
  Items: Array<{
    'Kode Item': string
    'Deskripsi Item': string
    'Kategori Item': string
    'COA': string
    'Deskripsi COA': string
    Satuan: string
    'Harga Satuan': number
    'Total QTY': number
    'Total Harga': number
  }>
}

export function buildPerlengkapanRequestBody(
  date: string,
  cabang: string,
  items: LineItem[],
): PerlengkapanRequestPayload {
  return {
    version: 'v1',
    'Tanggal Permintaan': date,
    Outlet: cabang,
    Status: 'Submitted',
    Items: items.map(it => {
      const harga = it.price || 0
      const totalHarga = harga * (it.quantity || 0)
      return {
        'Kode Item': it.id || '',
        'Deskripsi Item': it.name,
        'Kategori Item': it.category || '',
        'COA': it.coa || '',
        'Deskripsi COA': it.coaDescription || '',
        Satuan: it.unit,
        'Harga Satuan': harga,
        'Total QTY': it.quantity,
        'Total Harga': totalHarga,
      }
    }),
  }
}

export async function submitPerlengkapanRequest(body: PerlengkapanRequestPayload): Promise<Response> {
  return fetch(INPUT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
}
