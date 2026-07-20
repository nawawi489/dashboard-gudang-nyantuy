export type LineItem = {
  id?: string
  name: string
  unit: string
  quantity: number
  price?: number
  supplier?: string
  phone?: string
  brand?: string
  specification?: string
  coa?: string
  coaDescription?: string
  category?: string
  conversionUnit?: string
  conversionPrice?: number
  itemType?: string
  gramasiUnit?: string
  gramasiQuantity?: number
}

export type PRPayload = {
  date: string
  cabang: string
  items: LineItem[]
}

export type ApprovalStatus = 'Terima' | 'Tolak' | 'Pending'

export type ApprovalItem = {
  trxId: string
  tag?: string
  date?: string
  itemId?: string
  itemName: string
  outlet: string
  supplier: string
  unit: string
  quantity: number
  price: number
  status: ApprovalStatus
  verifikasiSpv?: boolean
  statusPembayaran?: string
  grandTotal?: number
  nomorInvoice?: string
  hargaKonversiResep?: number
  satuanKonversiResep?: string
  jumlahKonversiResep?: number
  inputKaspin?: boolean
}

export type ItemRow = {
  id?: string
  name: string
  unit: string
  supplier?: string
  price?: number
  phone?: string
  brand?: string
  specification?: string
  coa?: string
  coaDescription?: string
  category?: string
}

export type POWebhookPayload = {
  version: string
  'Tanggal PO': string
  Outlet: string
  'Nama Supplier': string
  'Nomor WhatsApp': string
  'Grand Total': number
  Status: string
  Items: Array<{
    'ID BARANG': string
    'Nama Barang': string
    SATUAN: string
    JUMLAH: number
    Harga: number
    Subtotal: number
  }>
}

export type FlatPOPayload = {
  version: string
  'Tanggal PO': string
  Outlet: string
  'Nama Supplier': string
  'Nomor WhatsApp': string
  'ID BARANG': string
  'Nama Barang': string
  SATUAN: string
  JUMLAH: number
  Harga: number
  Subtotal: number
  Status: string
}

export type InventoryApprovalStatus = 'Terima' | 'Tolak' | 'Pending'

export type InventoryApprovalItem = {
  trxId: string
  date?: string
  tanggalTerima?: string
  rowNumber?: number
  outlet: string
  itemId?: string
  supplier?: string
  itemName: string
  spesifikasi?: string
  quantity: number
  totalEstimasiBiaya: number
  status: InventoryApprovalStatus
  tanggalApproval?: string
  nominalDisetujui?: number
  verifikasiSpv?: boolean
  buktiDokumentasi?: string
  verifikasiInputAset?: boolean
  statusPembayaran?: string
  nomorInvoice?: string
}

export type InventoryApprovalPayload = {
  trxId: string
  itemId: string
  outlet: string
  status: 'Terima' | 'Tolak'
  alasan?: string
}


// --- SPV Types ---
export interface POItem {
  id_transaksi: string
  nama_barang: string
  outlet: string
  jumlah_po: number
  harga_satuan: number
  total_harga: number
  supplier: string
  id_barang?: string
  satuan?: string
  tanggal?: string
  jenis?: string
}

export interface ScanItem {
  nomor_invoice: string
  nama_barang: string
  jumlah_barang: number
  satuan_barang: string
  harga_satuan: number
  total_harga: number
  diskon_1: number | null
  diskon_2: number | null
  diskon_3: number | null
  diskon_4: number | null
  qty_free: number
  satuan_barang_free: string
  pajak: number
  grand_total: number
}

export type ScanResult = ScanItem[]

export interface ConfirmData {
  id_transaksi: string
  id_barang: string
  nama_barang: string
  jenis?: string
  jumlah_po: number
  jumlah_barang_nota: number
  satuan_nota: string
  jumlah_diterima: number
  satuan: string
  supplier: string
  outlet: string
  foto_nota: File | null
  foto_barang: File | null
  nomor_invoice: string
  keterangan_spv?: string
  produk_free?: number
  produk_free_satuan?: string
  tanggal_konfirmasi: string
  status?: 'DITERIMA' | 'KURANG'

  harga_satuan: number
  total_harga: number
  diskon1: number
  diskon2: number
  diskon3: number
  diskon4: number
  pajak: number
  grand_total: number
  nama_barang_nota: string
}

export interface PeralatanItem {
  id_pengajuan: string
  id_peralatan: string
  nama_peralatan: string
  supplier: string
  spesifikasi: string
  outlet: string
  qty: number
  total_estimasi_biaya: number
  tanggal_pengajuan: string
  status_approval_finance: string
  tanggal_approval: string
  catatan: string
  verifikasi_spv: boolean
  bukti_dokumentasi: string
  verifikasi_input_aset: boolean
}

export interface PeralatanConfirmData {
  id_pengajuan: string
  id_peralatan: string
  nama_peralatan: string
  spesifikasi: string
  qty: number
  jumlah_diterima: number
  outlet: string
  nomor_invoice: string
  ppn: number
  total_tagihan: number
  foto_dokumentasi: File | null
  foto_dokumentasi_nota: File | null
  keterangan_spv: string
  tanggal_konfirmasi: string
  status: 'DITERIMA' | 'KURANG'
}
