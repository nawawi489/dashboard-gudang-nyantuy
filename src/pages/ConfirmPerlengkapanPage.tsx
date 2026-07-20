import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'
import { LineItem } from '../types'
import { PerlengkapanRequestSubmitPayload } from '../hooks/usePerlengkapanRequest'
import { buildPerlengkapanRequestBody, submitPerlengkapanRequest } from '../services/perlengkapanRequest'
import { formatIDR } from '../utils/format'

export default function ConfirmPerlengkapanPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const data = (state as PerlengkapanRequestSubmitPayload) || {
    date: '',
    supplier: '',
    note: '',
    items: [],
  }
  const [submitting, setSubmitting] = useState(false)

  const items: LineItem[] = data.items || []
  const totalQuantity = items.reduce((sum, it) => sum + (it.quantity || 0), 0)
  const grandTotal = items.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 0)), 0)

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const body = buildPerlengkapanRequestBody(
        data.date,
        data.supplier,
        data.note,
        items,
      )

      const response = await submitPerlengkapanRequest(body)

      if (!response.ok) {
        throw new Error('Gagal mengirim permintaan perlengkapan')
      }

      navigate('/perlengkapan-success', {
        state: {
          items: items.map(it => ({
            name: it.name,
            unit: it.unit,
            quantity: it.quantity,
            id: it.id,
            price: it.price,
          })),
          supplier: data.supplier,
        },
      })
    } catch (e) {
      alert('Gagal mengirim permintaan perlengkapan. Coba lagi nanti.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 200 }}>
      <Header title="Konfirmasi Permintaan" backTo="/perlengkapan" />

      <section className="hero">
        <h1>Konfirmasi Permintaan Perlengkapan</h1>
        <p>Mohon periksa kembali daftar permintaan Anda sebelum dikirim.</p>
      </section>

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="form-grid" style={{ marginBottom: 8 }}>
          <div className="control"><div className="label">Tanggal</div><div>{data.date || '-'}</div></div>
          <div className="control"><div className="label">Supplier</div><div>{data.supplier || '-'}</div></div>
        </div>
      </section>

      <section className="panel" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
          Daftar Barang
        </div>

        <div className="item-list">
          {items.length === 0 ? (
            <div className="dropdown-empty">Tidak ada barang</div>
          ) : (
            items.map((it, idx) => (
              <div key={`${it.name}-${it.unit}-${idx}`} className="control line-row-3 item-row">
                <div>
                  <div className="label">Nama Barang</div>
                  <div>{it.name}</div>
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
                  <div className="label">Estimasi Biaya</div>
                  <div>{it.price ? formatIDR(it.price) : '-'}</div>
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
            <div className="control"><div className="label">Total Jumlah</div><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{totalQuantity}</div></div>
            <div className="control"><div className="label">Total Harga</div><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatIDR(grandTotal)}</div></div>
          </div>
          <div className="actions" style={{ marginTop: 0 }}>
            <button className="btn" onClick={() => navigate('/perlengkapan')}>Edit</button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting || items.length === 0}>
              {submitting ? 'Mengirim...' : 'Kirim Permintaan'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
