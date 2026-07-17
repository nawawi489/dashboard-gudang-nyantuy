import { Minus, Plus, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import ItemSearchDropdown from '../components/ItemSearchDropdown'
import { useInventoryRequest } from '../hooks/useInventoryRequest'
import { fetchInventoryRequestItems } from '../services/items'
export default function InventoryRequestPage() {
  const {
    date,
    supplier,
    invoice,
    note,
    itemName,
    unit,
    quantity,
    price,
    priceInput,
    isCustomItem,
    submitting,
    itemsList,
    handleDateChange,
    handleSupplierChange,
    handleInvoiceChange,
    handleNoteChange,
    handleQuantityChange,
    handleUnitChange,
    handlePriceChange,
    handleItemQuantityChange,
    handleRemoveItem,
    handleSubmit,
    addToList,
    handleSelectItem,
    isAddDisabled,
    isSubmitDisabled,
  } = useInventoryRequest()

  return (
    <div className="container">
      <Header title="Permintaan Peralatan" backTo="/" />
      <section className="hero">
        <h1>Permintaan Peralatan</h1>
        <p>Silakan isi form di bawah ini untuk mengajukan kebutuhan peralatan.</p>
      </section>

      <section className="panel">
        <div className="form-grid">
          <div className="control">
            <label className="label">Tanggal Pengajuan</label>
            <input type="date" className="input" value={date} onChange={handleDateChange} />
          </div>
          <div className="control">
            <label className="label">Nama Supplier</label>
            <input className="input" placeholder="Nama supplier" value={supplier} onChange={handleSupplierChange} />
          </div>
          <ItemSearchDropdown
            value={itemName}
            onChange={handleSelectItem}
            fetcher={fetchInventoryRequestItems}
            allowCustom
          />

          <div className="control">
            <label className="label">Qty</label>
            <input
              type="number"
              min={1}
              className="input"
              value={quantity}
              onChange={handleQuantityChange}
            />
          </div>
          <div className="control">
            <label className="label">Satuan Barang</label>
            <input
              className="input"
              placeholder="Contoh: pcs, unit, set"
              value={unit}
              onChange={handleUnitChange}
              readOnly={!isCustomItem}
            />
          </div>
          <div className="control">
            <label className="label">Total Estimasi Biaya</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="input"
              value={priceInput}
              onChange={handlePriceChange}
              placeholder="Masukkan estimasi biaya"
              style={{
                fontWeight: 600,
                color: 'var(--primary)',
                background: 'var(--primary-soft, rgba(0,0,0,0.04))',
                textAlign: 'right',
              }}
            />
          </div>
          <div className="control" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Catatan</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Catatan tambahan (opsional)"
              value={note}
              onChange={handleNoteChange}
            />
          </div>
        </div>
        <div className="actions">
          <button className="btn" disabled={isAddDisabled} onClick={addToList}>Tambah ke daftar</button>
          <button className="btn btn-primary" disabled={isSubmitDisabled} onClick={handleSubmit}>
            {submitting ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 12, backgroundColor: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
        {itemsList.length === 0 ? (
          <div className="panel dropdown-empty">Belum ada barang dalam daftar</div>
        ) : (
          <div className="panel" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 12, fontSize: '1.1rem' }}>
              Daftar Permintaan ({itemsList.length} item)
            </div>
            {itemsList.map((it, idx) => (
              <div key={`${it.name}-${it.unit}-${idx}`} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8 }}>{it.name}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{it.id || '-'}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{it.unit}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      className="btn"
                      style={{ padding: 8, minWidth: 32, display: 'grid', placeItems: 'center' }}
                      onClick={() => handleItemQuantityChange(idx, it.quantity - 1)}
                      disabled={it.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      style={{ width: 60, textAlign: 'center', padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}
                      value={it.quantity}
                      onChange={e => handleItemQuantityChange(idx, Number(e.target.value))}
                    />
                    <button
                      className="btn"
                      style={{ padding: 8, minWidth: 32, display: 'grid', placeItems: 'center' }}
                      onClick={() => handleItemQuantityChange(idx, it.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                    <div style={{ borderLeft: '1px solid #ccc', height: 24, margin: '0 8px' }}></div>
                    <button
                      className="btn"
                      style={{ color: 'red', borderColor: 'red', padding: 8, minWidth: 32, display: 'grid', placeItems: 'center' }}
                      onClick={() => handleRemoveItem(idx)}
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
