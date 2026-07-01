import { normalizeNumber, normalizeText } from '../utils/format'
import { WEBHOOK_FINANCE_VERIF_PO, WEBHOOK_LIST_PO } from '../config'
import { ApprovalItem, ApprovalStatus } from '../types'

export { type ApprovalItem, type ApprovalStatus }

type FinanceVerifPayload = {
  trxId: string
  itemId: string
  outlet: string
  nomorInvoice: string
}

export async function fetchApprovalItems(cabang?: string): Promise<ApprovalItem[]> {
  try {
    let url = WEBHOOK_LIST_PO
    const separator = url.includes('?') ? '&' : '?'
    // Selalu kirim parameter outlet, meskipun kosong, agar sesuai dengan logic Switch di n8n
    url = `${url}${separator}outlet=${encodeURIComponent(cabang || '')}`

    const res = await fetch(url, { 
      headers: { Accept: 'application/json' }, 
      cache: 'no-store' 
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

    const list = Array.isArray(data) ? data : (data?.data || data?.items || [])

    // Mapping data flat dari n8n (output workflow Get List PO)
    return list.map((row: any): ApprovalItem => {
      // Helper untuk parsing status
      const parseStatus = (val: any): ApprovalStatus => {
        const str = String(val || '').trim()
        const lower = str.toLowerCase()
        
        if (lower === 'terima' || lower === 'true') return 'Terima'
        if (lower === 'tolak' || lower === 'false') return 'Tolak' // Asumsi false = tolak, atau bisa jadi pending
        if (lower === 'pending') return 'Pending'
        
        return 'Pending'
      }

      // Helper untuk parsing boolean
      const parseBool = (val: any): boolean => {
        if (typeof val === 'boolean') return val
        const str = String(val).toLowerCase().trim()
        return str === 'true' || str === 'terima' || str === 'yes'
      }

      const hargaKonversiResepRaw =
        row['HARGA KONVERSI RESEP'] ??
        row['Harga Konversi Resep'] ??
        row.hargaKonversiResep

      const jumlahKonversiResepRaw =
        row['JUMLAH KONVERSI RESEP'] ??
        row['Jumlah Konversi Resep'] ??
        row.jumlahKonversiResep

      const satuanKonversiResepRaw =
        row['SATUAN KONVERSI RESEP'] ??
        row['Satuan Konversi Resep'] ??
        row.satuanKonversiResep

      const inputKaspinRaw =
        row['INPUT KASPIN'] ??
        row['Input Kaspin'] ??
        row['input kaspin'] ??
        row.inputKaspin

      return {
        trxId: normalizeText(row['ID TRANSAKSI'] || row.trxId || 'TRX-XXXX'),
        tag: 'PO',
        date: normalizeText(row['TANGGAL PO'] || row.date || ''),
        itemId: normalizeText(row['ID BARANG'] || row.itemId || ''),
        itemName: normalizeText(row['NAMA BARANG'] || row.itemName || ''),
        outlet: normalizeText(row.outlet || row.cabang || row.Cabang || '-'),
        supplier: normalizeText(row['NAMA SUPLIER'] || row.supplier || '-'),
        unit: normalizeText(row['SATUAN'] || row.unit || ''),
        quantity: normalizeNumber(row['JUMLAH'] || row.quantity || 0),
        price: normalizeNumber(row['HARGA'] || row.price || 0),
        verifikasiSpv: parseBool(row['VerifikasiSPV'] ?? row['Verifikasi SPV'] ?? row['verifikasi spv'] ?? row.verifikasiSpv),
        status: parseStatus(
          row['VerifikasiFinance'] ??
          row['Verifikasi Finance'] ??
          row['verifikasi finance'] ??
          row['Status'] ??
          row.status
        ),
        statusPembayaran: normalizeText(row['Status Pembayaran'] || row['status pembayaran'] || row['statusPembayaran'] || row.statusPembayaran || ''),
        grandTotal: normalizeNumber(row.grandTotal || 0),
        nomorInvoice: normalizeText(row['NOMOR INVOICE'] || row['Nomor Invoice'] || row.nomorInvoice || ''),
        hargaKonversiResep: hargaKonversiResepRaw != null && hargaKonversiResepRaw !== '' ? normalizeNumber(hargaKonversiResepRaw) : undefined,
        jumlahKonversiResep: jumlahKonversiResepRaw != null && jumlahKonversiResepRaw !== '' ? normalizeNumber(jumlahKonversiResepRaw) : undefined,
        satuanKonversiResep: satuanKonversiResepRaw != null && satuanKonversiResepRaw !== '' ? normalizeText(satuanKonversiResepRaw) : undefined,
        inputKaspin: inputKaspinRaw != null ? parseBool(inputKaspinRaw) : undefined,
      }
    })
  } catch (e) {
    console.error('Gagal mengambil data approval', e)
    throw e
  }
}

export async function submitFinanceVerification(payload: FinanceVerifPayload): Promise<boolean> {
  const response = await fetch(WEBHOOK_FINANCE_VERIF_PO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return true
}
