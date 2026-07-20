import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineItem, ItemRow } from '../types'

export type PerlengkapanRequestSubmitPayload = {
  date: string
  supplier: string
  note: string
  items: LineItem[]
}

export function usePerlengkapanRequest() {
  const navigate = useNavigate()

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [supplier, setSupplier] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [itemId, setItemId] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [price, setPrice] = useState<number>(0)
  const [priceInput, setPriceInput] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [itemsList, setItemsList] = useState<LineItem[]>([])

  const resetItem = () => {
    setItemId('')
    setItemName('')
    setUnit('')
    setQuantity(1)
    setPrice(0)
    setPriceInput('')
  }

  const handleSelectItem = (item: ItemRow | null, name: string) => {
    setItemName(name)
    if (item) {
      setItemId(item.id || '')
      setUnit(item.unit)
      setPrice(0)
      setPriceInput('')
    } else {
      setItemId('')
      setUnit('')
      setPrice(0)
      setPriceInput('')
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
      next[idx] = { ...prev, quantity: prev.quantity + quantity, price }
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
        },
      ])
    }

    resetItem()
  }

  const handleSubmit = () => {
    if (!date || !supplier) return
    if (itemsList.length === 0) {
      alert('Tambahkan minimal satu barang ke daftar sebelum mengirim.')
      return
    }
    setSubmitting(true)
    const payload: PerlengkapanRequestSubmitPayload = {
      date,
      supplier,
      note: note.trim(),
      items: itemsList,
    }
    navigate('/confirm-perlengkapan', { state: payload })
    setSubmitting(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSupplier(e.target.value)
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value))
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnit(e.target.value)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^\d]/g, '')
    setPriceInput(digitsOnly)
    setPrice(Number(digitsOnly || 0))
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

  const isCustomItem = !itemId && !!itemName.trim()
  const isAddDisabled = !itemName || !unit || quantity <= 0 || price <= 0
  const isSubmitDisabled = submitting || !date || !supplier || itemsList.length === 0

  return {
    date,
    supplier,
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
    handleNoteChange,
    handleQuantityChange,
    handleUnitChange,
    handlePriceChange,
    handleItemQuantityChange,
    handleRemoveItem,
    handleSubmit,
    resetItem,
    addToList,
    handleSelectItem,
    isAddDisabled,
    isSubmitDisabled,
  }
}
