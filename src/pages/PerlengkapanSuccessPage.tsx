import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { formatIDR } from '../utils/format'

export default function PerlengkapanSuccessPage() {
  const { state } = useLocation() as { state?: {
    items: Array<{ name: string; unit: string; quantity: number; id?: string; price?: number; coa?: string; coaDescription?: string; category?: string }>
    cabang: string
  } }
  const data = state || { items: [], cabang: '' }
  const totalQuantity = (data.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0)
  const totalHarga = (data.items || []).reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 0)), 0)

  return (
    <div className="container">
      <Header title="Permintaan Terkirim" backTo="/" />

      <section className="panel">
        <div className="form-grid" style={{ marginBottom: 12 }}>
          <div className="control"><div className="label">Cabang</div><div>{data.cabang || '-'}</div></div>
          <div className="control"><div className="label">Total Item</div><div>{(data.items || []).length}</div></div>
          <div className="control"><div className="label">Total Jumlah</div><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{totalQuantity}</div></div>
          <div className="control"><div className="label">Total Harga</div><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatIDR(totalHarga)}</div></div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 12 }}>Rincian Barang</div>
        {Array.isArray(data.items) && data.items.length > 0 ? (
          data.items.map((it, idx) => (
            <div key={`${it.name}-${it.unit}-${idx}`} className="control line-row-3 item-row">
              <div>
                <div className="label">Nama Barang</div>
                <div>{it.name}</div>
              </div>
              <div>
                <div className="label">Kategori</div>
                <div>{it.category || '-'}</div>
              </div>
              <div>
                <div className="label">COA</div>
                <div>{it.coa || '-'}</div>
              </div>
              <div>
                <div className="label">Satuan</div>
                <div>{it.unit}</div>
              </div>
              <div>
                <div className="label">Jumlah</div>
                <div>{it.quantity}</div>
              </div>
              <div>
                <div className="label">Harga</div>
                <div>{it.price ? formatIDR(it.price) : '-'}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="dropdown-empty">Tidak ada item</div>
        )}
      </section>

      <section className="actions" style={{ marginTop: 12 }}>
        <Link to="/perlengkapan" className="btn btn-primary">Buat Permintaan Lagi</Link>
        <Link to="/" className="btn">Kembali ke Menu Utama</Link>
      </section>
    </div>
  )
}
