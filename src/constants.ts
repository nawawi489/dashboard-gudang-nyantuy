export const GUDANG = [
  'Toko Tayyibah',
] as const

export type GudangName = typeof GUDANG[number]

export type Role = 'purchasing' | 'spv'

export const ROLES: Role[] = ['purchasing', 'spv']

export const ROLE_LABEL: Record<Role, string> = {
  purchasing: 'Purchasing',
  spv: 'Admin Warehouse',
}

export type MenuItem = {
  key: string
  title: string
  subtitle: string
  emoji: string
  href: string
}

// Menu yang tampil di HomePage per-role.
// Untuk menambah menu baru (terutama SPV), tambahkan entry di sini.
export const ROLE_MENUS: Record<Role, MenuItem[]> = {
  purchasing: [
    { key: 'pr', title: 'Permintaan PO', subtitle: 'Ajukan kebutuhan pembelian', emoji: '📝', href: '/pr' },
    { key: 'pr-manual', title: 'Input Barang Baru Ke Database', subtitle: 'Input barang baru ke database', emoji: '✏️', href: '/pr-manual' },
    { key: 'approval', title: 'Approval PO', subtitle: 'Cek status pesanan PO', emoji: '✅', href: '/approval' },
    { key: 'struk', title: 'Input Struk', subtitle: 'Upload bukti struk pembelian', emoji: '📸', href: '/struk' },
    { key: 'bill', title: 'Tagihan PO', subtitle: 'Input bukti pembayaran tagihan PO', emoji: '🧾', href: '/bill' },
    { key: 'inventory-request', title: 'Permintaan Peralatan', subtitle: 'Ajukan kebutuhan peralatan', emoji: '📦', href: '/inventory-request' },
    { key: 'approval-inventory', title: 'Approval Permintaan Inventaris', subtitle: 'Cek & setujui pengajuan inventaris', emoji: '🗂️', href: '/approval-inventory' },
    { key: 'bill-inventory', title: 'Tagihan Inventaris', subtitle: 'Input bukti pembayaran tagihan inventaris', emoji: '🧾', href: '/bill-inventory' },
    { key: 'perlengkapan', title: 'Permintaan Perlengkapan', subtitle: 'Ajukan kebutuhan perlengkapan', emoji: '🧰', href: '/perlengkapan' },
    { key: 'approval-perlengkapan', title: 'Approval Permintaan Perlengkapan', subtitle: 'Cek & setujui pengajuan perlengkapan', emoji: '🗂️', href: '/approval-perlengkapan' },
    { key: 'bill-perlengkapan', title: 'Tagihan Perlengkapan', subtitle: 'Input bukti pembayaran tagihan perlengkapan', emoji: '🧾', href: '/bill-perlengkapan' },
  ],
  spv: [
    { key: 'spv-home', title: 'Admin Warehouse Dashboard', subtitle: 'Pilih outlet dan akses menu Admin Warehouse', emoji: '🛡️', href: '/spv/home' },
  ],
}

// Route → role yang boleh akses. Route yang tidak masuk map ini
// dianggap boleh diakses semua role yang sudah login.
export const ROUTE_ROLES: Record<string, Role[]> = {
  '/pr': ['purchasing'],
  '/pr-manual': ['purchasing'],
  '/struk': ['purchasing'],
  '/bill': ['purchasing'],
  '/inventory-request': ['purchasing'],
  '/confirm-inventory-request': ['purchasing'],
  '/inventory-request-success': ['purchasing'],
  '/approval': ['purchasing'],
  '/approval-inventory': ['purchasing'],
  '/bill-inventory': ['purchasing'],
  '/perlengkapan': ['purchasing'],
  '/confirm-perlengkapan': ['purchasing'],
  '/perlengkapan-success': ['purchasing'],
  '/bill-perlengkapan': ['purchasing'],
  '/approval-perlengkapan': ['purchasing'],
  // SPV routes
  '/spv/home': ['spv'],
  '/spv/outlet': ['spv'],
  '/spv/po': ['spv'],
  '/spv/peralatan': ['spv'],
  '/spv/perlengkapan': ['spv'],
}

// --- SPV Constants ---
export const SPV_OUTLETS = [
  'Toko Tayyibah',
] as const

export const SPV_MAX_PHOTOS = 1
export const SPV_MIN_PHOTOS = 1
