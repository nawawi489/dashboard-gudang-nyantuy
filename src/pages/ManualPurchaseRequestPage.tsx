import { useState } from 'react'
import Header from '../components/Header'
import JenisBarangDropdown from '../components/JenisBarangDropdown'
import DatabaseFieldDropdown from '../components/DatabaseFieldDropdown'
import { usePurchaseRequest } from '../hooks/usePurchaseRequest'
import { WEBHOOK_INPUT_DATABASE } from '../config'

export default function ManualPurchaseRequestPage() {
  const {
    itemName,
    unit,
    quantity,
    supplier,
    price,
    phone,
    conversionUnit,
    conversionPrice,
    itemType,
    gramasiUnit,
    gramasiQuantity,
    handleQuantityChange,
    resetForm,
    handleSelectItem,
    handleUnitChange,
    handleSupplierChange,
    handlePriceChange,
    handlePhoneChange,
    handleConversionUnitChange,
    handleConversionPriceChange,
    handleItemTypeChange,
    handleGramasiUnitChange,
    handleGramasiQuantityChange,
  } = usePurchaseRequest()

  const [submitting, setSubmitting] = useState(false)
  const [top, setTop] = useState('')

  const isSubmitDisabled = submitting || !itemName || !unit || quantity <= 0

  const handleSubmitToDatabase = async () => {
    if (!itemName || !unit || quantity <= 0) return
    setSubmitting(true)
    try {
      const payload = {
        'Nama Supplier': supplier || '',
        'Nomor WhatsApp': (phone || '').replace(/[^0-9]/g, ''),
        'Nama Barang': itemName,
        'Satuan': unit,
        'Harga': price || 0,
        'Satuan Konversi': conversionUnit || '',
        'Harga Satuan Konversi': conversionPrice || 0,
        'Jumlah': quantity,
        'Jenis Barang': itemType || '',
        'Satuan Gramasi': gramasiUnit || '',
        'Jumlah Satuan Gramasi': gramasiQuantity || 0,
        'TOP': top,
      }

      const response = await fetch(WEBHOOK_INPUT_DATABASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Gagal mengirim data')

      alert('Data berhasil dikirim ke database!')
      resetForm()
      setTop('')
    } catch (e) {
      alert('Gagal mengirim data. Coba lagi nanti.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <Header title="Input Barang Baru Ke Database" backTo="/" />
      <section className="hero">
        <h1>Input Barang Baru Ke Database</h1>
        <p>Input barang baru ke database.</p>
      </section>

      <section className="panel">
        <div className="form-grid">
          <div className="control">
            <label className="label">Nama Supplier</label>
            <input className="input" placeholder="Nama supplier" value={supplier} onChange={handleSupplierChange} />
          </div>
          <div className="control">
            <label className="label">Nomor WhatsApp</label>
            <input className="input" placeholder="08xxxxxxxxxx" value={phone} onChange={handlePhoneChange} />
          </div>
          <div className="control">
            <label className="label">Nama Barang</label>
            <input
              className="input"
              placeholder="Ketik nama barang"
              value={itemName}
              onChange={e => handleSelectItem(null, e.target.value)}
            />
          </div>
          <DatabaseFieldDropdown
            label="Satuan"
            fieldName="Satuan"
            value={unit}
            onChange={val => handleUnitChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)}
            placeholder="Cari atau pilih satuan"
          />
          <div className="control">
            <label className="label">Harga</label>
            <input className="input" placeholder="0" value={price || ''} onChange={handlePriceChange} />
          </div>
          <DatabaseFieldDropdown
            label="Satuan Konversi"
            fieldName="Satuan"
            value={conversionUnit}
            onChange={val => handleConversionUnitChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)}
            placeholder="Cari atau pilih satuan konversi"
          />
          <div className="control">
            <label className="label">Harga Satuan Konversi</label>
            <input className="input" placeholder="0" value={conversionPrice || ''} onChange={handleConversionPriceChange} />
          </div>
          <div className="control">
            <label className="label">Jumlah (Total dalam kg/pack dalam satu karton)</label>
            <input type="number" min={1} className="input" value={quantity} onChange={handleQuantityChange} />
          </div>
          <JenisBarangDropdown
            value={itemType}
            onChange={val => handleItemTypeChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)}
          />
          <DatabaseFieldDropdown
            label="Satuan Gramasi (Pcs/Gram)"
            fieldName="Satuan Gramasi"
            value={gramasiUnit}
            onChange={val => handleGramasiUnitChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)}
            placeholder="Cari atau pilih satuan gramasi"
          />
          <div className="control">
            <label className="label">Jumlah Satuan Gramasi (Total pcs/gram dalam 1 karton)</label>
            <input type="number" min={0} className="input" value={gramasiQuantity || ''} onChange={handleGramasiQuantityChange} />
          </div>
          <div className="control">
            <label className="label">TOP (Jatuh Tempo)</label>
            <input
              type="number"
              min={0}
              className="input"
              placeholder="Contoh: 7, 14, 30"
              value={top}
              onChange={e => setTop(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => { resetForm(); setTop('') }}>Reset</button>
          <button className="btn btn-primary" disabled={isSubmitDisabled} onClick={handleSubmitToDatabase}>
            {submitting ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </section>
    </div>
  )
}
