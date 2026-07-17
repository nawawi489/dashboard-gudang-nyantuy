import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineItem, ItemRow } from '../types'
import { GUDANG } from '../constants'

type GroupedItems = Record<string, LineItem[]>

export function usePurchaseRequest() {
  const navigate = useNavigate()
  const cabangs = GUDANG

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [cabang, setCabang] = useState<string>('')
  const [itemId, setItemId] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [supplier, setSupplier] = useState<string>('')
  const [price, setPrice] = useState<number>(0)
  const [phone, setPhone] = useState<string>('')
  const [conversionUnit, setConversionUnit] = useState<string>('')
  const [conversionPrice, setConversionPrice] = useState<number>(0)
  const [itemType, setItemType] = useState<string>('')
  const [gramasiUnit, setGramasiUnit] = useState<string>('')
  const [gramasiQuantity, setGramasiQuantity] = useState<number>(0)
  const [itemsList, setItemsList] = useState<LineItem[]>([])

  const resetForm = () => {
    setItemId('')
    setItemName('')
    setUnit('')
    setSupplier('')
    setPrice(0)
    setPhone('')
    setConversionUnit('')
    setConversionPrice(0)
    setItemType('')
    setGramasiUnit('')
    setGramasiQuantity(0)
    setQuantity(1)
  }

  const handleSelectItem = (item: ItemRow | null, name: string) => {
    setItemName(name)
    if (item) {
      setItemId(item.id || '')
      setUnit(item.unit)
      setSupplier(item.supplier || '')
      setPrice(item.price || 0)
      setPhone(item.phone || '')
    }
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnit(e.target.value)
  }

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSupplier(e.target.value)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value.replace(/\D/g, '')) || 0)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)
  }

  const handleConversionUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConversionUnit(e.target.value)
  }

  const handleConversionPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConversionPrice(Number(e.target.value.replace(/\D/g, '')) || 0)
  }

  const handleItemTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemType(e.target.value)
  }

  const handleGramasiUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGramasiUnit(e.target.value)
  }

  const handleGramasiQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGramasiQuantity(Number(e.target.value) || 0)
  }

  const addToList = () => {
    if (!itemName || !unit || quantity <= 0) return
    const currentSupplier = supplier || ''

    const idx = itemsList.findIndex(
      (it) => it.name === itemName && it.unit === unit && it.supplier === currentSupplier,
    )

    if (idx >= 0) {
      const next = [...itemsList]
      const prev = next[idx]
      next[idx] = {
        ...prev,
        quantity: prev.quantity + quantity,
        price: price || prev.price,
        supplier: currentSupplier || prev.supplier,
        phone: phone || prev.phone,
        conversionUnit: conversionUnit || prev.conversionUnit,
        conversionPrice: conversionPrice || prev.conversionPrice,
        itemType: itemType || prev.itemType,
        gramasiUnit: gramasiUnit || prev.gramasiUnit,
        gramasiQuantity: gramasiQuantity || prev.gramasiQuantity,
      }
      setItemsList(next)
    } else {
      setItemsList([
        ...itemsList,
        {
          id: itemId,
          name: itemName,
          unit,
          quantity,
          price,
          supplier: currentSupplier,
          phone,
          conversionUnit,
          conversionPrice,
          itemType,
          gramasiUnit,
          gramasiQuantity,
        },
      ])
    }

    resetForm()
  }

  const groupedItems = useMemo<GroupedItems>(() => {
    return itemsList.reduce((acc, item) => {
      const key = item.supplier || 'Tanpa Supplier'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {} as GroupedItems)
  }, [itemsList])

  const handleSubmit = async () => {
    if (!date || !cabang) return
    if (itemsList.length === 0) {
      alert('Tambahkan minimal satu barang ke daftar sebelum mengirim.')
      return
    }
    setSubmitting(true)
    const payload = { date, cabang, items: itemsList }
    navigate('/confirm-po', { state: payload })
    setSubmitting(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handleCabangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCabang(e.target.value)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value))
  }

  const handleItemQuantityChange = (idx: number, val: number) => {
    const q = val || 1
    const next = [...itemsList]
    next[idx] = { ...next[idx], quantity: q }
    setItemsList(next)
  }

  const handleRemoveItem = (idx: number) => {
    const next = itemsList.filter((_, i) => i !== idx)
    setItemsList(next)
  }

  const isAddDisabled = !itemName || !unit || quantity <= 0
  const isSubmitDisabled = submitting || !date || !cabang || itemsList.length === 0

  return {
    cabangs,
    date,
    cabang,
    itemName,
    unit,
    quantity,
    submitting,
    supplier,
    price,
    phone,
    conversionUnit,
    conversionPrice,
    itemType,
    gramasiUnit,
    gramasiQuantity,
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
    handlePhoneChange,
    handleConversionUnitChange,
    handleConversionPriceChange,
    handleItemTypeChange,
    handleGramasiUnitChange,
    handleGramasiQuantityChange,
    isAddDisabled,
    isSubmitDisabled,
  }
}