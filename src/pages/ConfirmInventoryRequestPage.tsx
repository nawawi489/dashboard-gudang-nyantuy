import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'
import { LineItem } from '../types'
import { InventoryRequestSubmitPayload } from '../hooks/useInventoryRequest'
import { buildInventoryRequestBody, submitInventoryRequest } from '../services/inventoryRequest'

export default function ConfirmInventoryRequestPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const data = (state as InventoryRequestSubmitPayload) || {
    date: '',
    supplier: '',
    invoice: '',
    note: '',
    items: [],
  }
  const [submitting, setSubmitting] = useState(false)

  const items: LineItem[] = data.items || []
  const totalQuantity = items.reduce((sum, it) => sum + (it.quantity || 0), 0)

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const body = buildInventoryRequestBody(
        data.date,
        data.supplier,
        data.invoice,
        data.note,
        items,
      )

      const response = await submitInventoryRequest(body)

      if (!response.ok) {
        throw new Error('Gagal mengirim permintaan peralatan')
      }

      navigate('/inventory-request-success', {
        state: {
          items: items.map(it => ({
            name: it.name,
            unit: it.unit,
            quantity: it.quantity,
            id: it.id,
          })),
          supplier: data.supplier,
        },
      })
    } catch (e) {
      alert('Gagal mengirim permintaan peralatan. Coba lagi nanti.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 200 }}>
      <Header title="Konfirmasi Permintaan" backTo="/inventory-request" />

      <section className="hero">
        <h1>Konfirmasi Permintaan Peralatan</h1>
        <p>Mohon periksa kembali daftar permintaan Anda sebelum dikirim.</p>
      </section>

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="form-grid" style={{ marginBottom: 8 }}>
          <div className="control"><div className="label">Tanggal Pengajuan</div><div>{data.date || '-'}</div></div>
          <div className="control"><div className="label">Nama Supplier</div><div>{data.supplier || '-'}</div></div>
          <div className="control"><div className="label">Nomor Invoice</div><div>{data.invoice || '-'}</div></div>
        </div>
        {data.note && (
          <div className="control" style={{ marginTop: 8 }}>
            <div className="label">Catatan</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{data.note}</div>
          </div>
        )}
      </section>

      <section className="panel" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
          Daftar Peralatan
        </div>

        <div className="item-list">
          {items.length === 0 ? (
            <div className="dropdown-empty">Tidak ada barang</div>
          ) : (
            items.map((it) => (
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
          )}
        </div>
      </section>

      <section className="panel" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        margin: 0,
        borderRadius: '16px 16px 0 0',
        border: 'none',
        borderTop: '2px solid var(--primary)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        zIndex: 100,
        backgroundColor: '#fff',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="control"><div className="label">Total Item</div><div>{items.length}</div></div>
            <div className="control"><div className="label">Total Qty</div><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{totalQuantity}</div></div>
          </div>
          <div className="actions" style={{ marginTop: 0 }}>
            <button className="btn" onClick={() => navigate('/inventory-request')}>Edit</button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting || items.length === 0}>
              {submitting ? 'Mengirim...' : 'Kirim Permintaan'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
