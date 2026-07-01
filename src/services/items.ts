import { normalizeNumber, normalizeText } from '../utils/format'
import { WEBHOOK_GET_BARANG, WEBHOOK_LIST_PENGAJUAN_INVENTARIS } from '../config'
import { ItemRow } from '../types'

export type { ItemRow }

function toItemRow(row: any): ItemRow {
  return {
    id: normalizeText(row['ID BARANG'] ?? row.id ?? row.itemId ?? row['Item ID']),
    name: normalizeText(
      row.Barang ??
      row['Nama Barang'] ??
      row.item_name ??
      row.nama_barang ??
      row.item ??
      row.name,
    ),
    unit: normalizeText(
      row.Satuan ??
      row.SATUAN ??
      row.unit ??
      row.satuan,
    ),
    supplier: normalizeText(row['Nama Supplier'] ?? row.supplier),
    price: normalizeNumber(row.Harga ?? row.price),
    phone: normalizeText(row['Nomor WhatsApp'] ?? row.whatsapp ?? row.phone),
  }
}

function toInventoryItemRow(row: any): ItemRow {
  // Payload inventaris tidak punya field "Satuan" -> default "pcs"
  return {
    id: normalizeText(row['ID Peralatan'] ?? row['ID Barang'] ?? row.id),
    name: normalizeText(row['Nama Peralatan'] ?? row['Nama Barang'] ?? row.name),
    unit: normalizeText(row.Satuan ?? row.SATUAN ?? row.unit ?? row.satuan) || 'pcs',
    price: normalizeNumber(row.Harga ?? row.price),
    brand: normalizeText(row['Merk'] ?? row.merk),
    specification: normalizeText(row['Spesifikasi/Tipe'] ?? row.spesifikasi ?? row.specification),
  }
}

export async function fetchItemsFrom(
  url: string,
  mapper: (row: any) => ItemRow = toItemRow,
): Promise<ItemRow[]> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)

    const data = await res.json()
    const list = Array.isArray(data) ? data : (data?.data || data?.items || [])

    if (!Array.isArray(list)) return []

    const mapped: ItemRow[] = list.map(mapper)

    // Deduplicate by name
    const dedup = new Map<string, ItemRow>()
    for (const it of mapped) {
      if (!it.name) continue
      if (!dedup.has(it.name)) dedup.set(it.name, it)
    }

    return Array.from(dedup.values())
  } catch (e) {
    console.error('Gagal mengambil data barang', e)
    return []
  }
}

export async function fetchItems(): Promise<ItemRow[]> {
  return fetchItemsFrom(WEBHOOK_GET_BARANG)
}

export async function fetchInventoryRequestItems(): Promise<ItemRow[]> {
  return fetchItemsFrom(WEBHOOK_LIST_PENGAJUAN_INVENTARIS, toInventoryItemRow)
}
