import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineItem, ItemRow } from '../types'
import { GUDANG } from '../constants'

export type PerlengkapanRequestSubmitPayload = {
  date: string
  cabang: string
  items: LineItem[]
}

export function usePerlengkapanRequest() {
  const navigate = useNavigate()
  const cabangs = GUDANG

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [cabang, setCabang] = useState<string>('')
  const [itemId, setItemId] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [price, setPrice] = useState<number>(0)
  const [coa, setCoa] = useState<string>('')
  const [coaDescription, setCoaDescription] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [itemsList, setItemsList] = useState<LineItem[]>([])

  const resetItem = () => {
    setItemId('')
    setItemName('')
    setUnit('')
    setQuantity(1)
    setPrice(0)
    setCoa('')
    setCoaDescription('')
    setCategory('')
  }

  const handleSelectItem = (item: ItemRow | null, name: string) => {
    setItemName(name)
    if (item) {
      setItemId(item.id || '')
      setUnit(item.unit)
      setPrice(item.price || 0)
      setCoa(item.coa || '')
      setCoaDescription(item.coaDescription || '')
      setCategory(item.category || '')
    }
  }

  const addToList = () => {
    if (!itemName || !unit || quantity <= 0) return

    const idx = itemsList.findIndex(
      (it) => it.name === itemName && it.unit === unit,
    )

    if (idx >= 0) {
      const next = [...itemsList]
      const prev = next[idx]
      next[idx] = { ...prev, quantity: prev.quantity + quantity }
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
          coa,
          coaDescription,
          category,
        },
      ])
    }

    resetItem()
  }

  const handleSubmit = () => {
    if (!date || !cabang) return
    if (itemsList.length === 0) {
      alert('Tambahkan minimal satu barang ke daftar sebelum mengirim.')
      return
    }
    setSubmitting(true)
    const payload: PerlengkapanRequestSubmitPayload = {
      date,
      cabang,
      items: itemsList,
    }
    navigate('/confirm-perlengkapan', { state: payload })
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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value))
  }

  const handleCoaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoa(e.target.value)
  }

  const handleCoaDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoaDescription(e.target.value)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value)
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
    price,
    coa,
    coaDescription,
    category,
    submitting,
    itemsList,
    handleDateChange,
    handleCabangChange,
    handleQuantityChange,
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
  }
}
