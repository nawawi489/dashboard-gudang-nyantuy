export const GUDANG = [
  'Gudang Nyantuy Makassar',
] as const

export type GudangName = typeof GUDANG[number]

export type Role = 'purchasing' | 'spv'

export const ROLES: Role[] = ['purchasing', 'spv']

export const ROLE_LABEL: Record<Role, string> = {
  purchasing: 'Purchasing',
  spv: 'Supervisor (SPV)',
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
    { key: 'approval', title: 'Approval PO', subtitle: 'Cek status pesanan PO', emoji: '✅', href: '/approval' },
    { key: 'struk', title: 'Input Struk', subtitle: 'Upload bukti struk pembelian', emoji: '📸', href: '/struk' },
    { key: 'bill', title: 'Tagihan PO', subtitle: 'Input bukti pembayaran tagihan PO', emoji: '🧾', href: '/bill' },
    { key: 'inventory-request', title: 'Permintaan Inventaris', subtitle: 'Ajukan kebutuhan inventaris', emoji: '📦', href: '/inventory-request' },
    { key: 'approval-inventory', title: 'Approval Permintaan Inventaris', subtitle: 'Cek & setujui pengajuan inventaris', emoji: '🗂️', href: '/approval-inventory' },
  ],
  spv: [
    { key: 'spv-home', title: 'SPV Dashboard', subtitle: 'Pilih outlet dan akses menu SPV', emoji: '🛡️', href: '/spv/home' },
  ],
}

// Route → role yang boleh akses. Route yang tidak masuk map ini
// dianggap boleh diakses semua role yang sudah login.
export const ROUTE_ROLES: Record<string, Role[]> = {
  '/pr': ['purchasing'],
  '/struk': ['purchasing'],
  '/bill': ['purchasing'],
  '/inventory-request': ['purchasing'],
  '/confirm-inventory-request': ['purchasing'],
  '/inventory-request-success': ['purchasing'],
  '/approval': ['purchasing'],
  '/approval-inventory': ['purchasing'],
  // SPV routes
  '/spv/home': ['spv'],
  '/spv/outlet': ['spv'],
  '/spv/po': ['spv'],
  '/spv/peralatan': ['spv'],
}

// --- SPV Constants ---
export const SPV_OUTLETS = [
  'Gudang Nyantuy Makassar',
] as const

export const SPV_MAX_PHOTOS = 1
export const SPV_MIN_PHOTOS = 1
