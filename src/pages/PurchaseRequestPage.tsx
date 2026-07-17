import { Minus, Plus, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import ItemSearchDropdown from '../components/ItemSearchDropdown'
import { usePurchaseRequest } from '../hooks/usePurchaseRequest'

export default function PurchaseRequestPage() {
  const {
    cabangs,
    date,
    cabang,
    itemName,
    unit,
    quantity,
    submitting,
    supplier,
    price,
    itemsList,
    groupedItems,
    handleDateChange,
    handleCabangChange,
    handleQuantityChange,
    handleItemQuantityChange,
    handleRemoveItem,
    handleSubmit,
    resetForm,
    addToList,
    handleSelectItem,
    handleUnitChange,
    handleSupplierChange,
    handlePriceChange,
    isAddDisabled,
    isSubmitDisabled,
  } = usePurchaseRequest()

  return (
    <div className="container">
      <Header title="Permintaan Pembelian" backTo="/" />
      <section className="hero">
        <h1>Permintaan PO</h1>
        <p>Silakan isi form di bawah ini untuk input PO.</p>
      </section>

      <section className="panel">
        <div className="form-grid">
          <div className="control">
            <label className="label">Tanggal PO</label>
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
          />

          <div className="control">
            <label className="label">Satuan</label>
            <input className="input" placeholder="Otomatis dari database" value={unit} readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </div>
          <div className="control">
            <label className="label">Nama Supplier</label>
            <input className="input" placeholder="Otomatis dari database" value={supplier} readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </div>
          <div className="control">
            <label className="label">Harga Satuan</label>
            <input className="input" placeholder="Otomatis dari database" value={price || ''} readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </div>
          <div className="control">
            <label className="label">Jumlah</label>
            <input type="number" min={1} className="input" value={quantity} onChange={handleQuantityChange} />
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={resetForm}>Reset</button>
          <button className="btn" disabled={isAddDisabled} onClick={addToList}>Tambah ke daftar</button>
          <button className="btn btn-primary" disabled={isSubmitDisabled} onClick={handleSubmit}>Kirim</button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 12, backgroundColor: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
        {itemsList.length === 0 ? (
          <div className="panel dropdown-empty">Belum ada barang dalam daftar</div>
        ) : (
          Object.entries(groupedItems).map(([supplierName, items]) => (
            <div key={supplierName} className="panel" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 12, fontSize: '1.1rem' }}>{supplierName}</div>
              {items.map((it, idx) => {
                // Find original index in itemsList for updates
                const originalIdx = itemsList.indexOf(it)
                return (
                   <div key={idx} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
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
                           onClick={() => handleItemQuantityChange(originalIdx, it.quantity - 1)}
                           disabled={it.quantity <= 1}
                         >
                           <Minus size={16} />
                         </button>
                         <input 
                           type="number" 
                           min={1} 
                           style={{ width: 60, textAlign: 'center', padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}
                           value={it.quantity} 
                           onChange={e => handleItemQuantityChange(originalIdx, Number(e.target.value))} 
                         />
                         <button 
                           className="btn" 
                           style={{ padding: 8, minWidth: 32, display: 'grid', placeItems: 'center' }}
                           onClick={() => handleItemQuantityChange(originalIdx, it.quantity + 1)}
                         >
                           <Plus size={16} />
                         </button>
                         <div style={{ borderLeft: '1px solid #ccc', height: 24, margin: '0 8px' }}></div>
                          <button 
                            className="btn" 
                            style={{ color: 'red', borderColor: 'red', padding: 8, minWidth: 32, display: 'grid', placeItems: 'center' }} 
                            onClick={() => handleRemoveItem(originalIdx)}
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                     </div>
                   </div>
                 )
              })}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
