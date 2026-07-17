import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'

export default function InventoryRequestSuccessPage() {
  const { state } = useLocation() as { state?: {
    items: Array<{ name: string; unit: string; quantity: number; id?: string }>
    supplier: string
  } }
  const data = state || { items: [], supplier: '' }
  const totalQuantity = (data.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0)

  return (
    <div className="container">
      <Header title="Permintaan Terkirim" backTo="/" />

      <section className="panel">
        <div className="form-grid" style={{ marginBottom: 12 }}>
          <div className="control"><div className="label">Nama Supplier</div><div>{data.supplier || '-'}</div></div>
          <div className="control"><div className="label">Total Item</div><div>{(data.items || []).length}</div></div>
          <div className="control"><div className="label">Total Qty</div><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{totalQuantity}</div></div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 12 }}>Rincian Peralatan</div>
        {Array.isArray(data.items) && data.items.length > 0 ? (
          data.items.map((it) => (
            <div key={it.name + it.unit} className="control line-row-3 item-row">
              <div>
                <div className="label">Nama Peralatan</div>
                <div>{it.name}</div>
              </div>
              <div>
                <div className="label">Satuan Barang</div>
                <div>{it.unit}</div>
              </div>
              <div>
                <div className="label">Qty</div>
                <div>{it.quantity}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="dropdown-empty">Tidak ada item</div>
        )}
      </section>

      <section className="actions" style={{ marginTop: 12 }}>
        <Link to="/inventory-request" className="btn btn-primary">Buat Permintaan Lagi</Link>
        <Link to="/" className="btn">Kembali ke Menu Utama</Link>
      </section>
    </div>
  )
}
