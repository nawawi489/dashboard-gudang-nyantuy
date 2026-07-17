import { Minus, Plus, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import ItemSearchDropdown from '../components/ItemSearchDropdown'
import { usePerlengkapanRequest } from '../hooks/usePerlengkapanRequest'
import { fetchPerlengkapanItems } from '../services/items'
import { formatIDR } from '../utils/format'

export default function PerlengkapanRequestPage() {
  const {
    cabangs,
    date,
    cabang,
    itemName,
    unit,
    quantity,
    price,
    coa,
    coaDescription,
    category,
    submitting,
    itemsList,
    handleDateChange,
    handleCabangChange,
    handleQuantityChange,
    handleUnitChange,
    handlePriceChange,
    handleCoaChange,
    handleCoaDescriptionChange,
    handleCategoryChange,
    handleItemQuantityChange,
    handleRemoveItem,
    handleSubmit,
    addToList,
    handleSelectItem,
    isAddDisabled,
    isSubmitDisabled,
  } = usePerlengkapanRequest()

  return (
    <div className="container">
      <Header title="Permintaan Perlengkapan" backTo="/" />
      <section className="hero">
        <h1>Permintaan Perlengkapan</h1>
        <p>Silakan isi form di bawah ini untuk mengajukan kebutuhan perlengkapan.</p>
      </section>

      <section className="panel">
        <div className="form-grid">
          <div className="control">
            <label className="label">Tanggal</label>
            <input type="date" className="input" value={date} onChange={handleDateChange} />
          </div>
          <div className="control">
            <label className="label">Cabang</label>
            <select className="select" value={cabang} onChange={handleCabangChange}>
              <option value="">Pilih Cabang</option>
              {cabangs.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>

          <ItemSearchDropdown
            value={itemName}
            onChange={handleSelectItem}
            fetcher={fetchPerlengkapanItems}
            allowCustom
          />

          <div className="control">
            <label className="label">Satuan</label>
            <input className="input" placeholder="Contoh: pcs" value={unit} onChange={handleUnitChange} />
          </div>
          <div className="control">
            <label className="label">COA</label>
            <input className="input" placeholder="Contoh: 6200" value={coa} onChange={handleCoaChange} />
          </div>
          <div className="control">
            <label className="label">Deskripsi COA</label>
            <input className="input" placeholder="Contoh: Beban Perlengkapan Outlet" value={coaDescription} onChange={handleCoaDescriptionChange} />
          </div>
          <div className="control">
            <label className="label">Kategori Item</label>
            <input className="input" placeholder="Contoh: ATK" value={category} onChange={handleCategoryChange} />
          </div>
          <div className="control">
            <label className="label">Harga</label>
            <input type="number" min={0} className="input" value={price} onChange={handlePriceChange} />
          </div>
          <div className="control">
            <label className="label">Jumlah</label>
            <input type="number" min={1} className="input" value={quantity} onChange={handleQuantityChange} />
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
          <div className="panel dropdown-empty">Belum ada barang di daftar</div>
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
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{it.price ? formatIDR(it.price) : '-'}</div>
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
