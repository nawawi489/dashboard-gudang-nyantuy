import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineItem, ItemRow } from '../types'

type GroupedItems = Record<string, LineItem[]>

export type InventoryRequestSubmitPayload = {
  date: string
  supplier: string
  invoice: string
  note: string
  items: LineItem[]
}

export function useInventoryRequest() {
  const navigate = useNavigate()

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [supplier, setSupplier] = useState<string>('')
  const [invoice, setInvoice] = useState<string>('')
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

  const groupedItems = useMemo<GroupedItems>(() => {
    return itemsList.reduce((acc, item) => {
      const key = supplier || 'Permintaan Peralatan'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {} as GroupedItems)
  }, [itemsList, supplier])

  const handleSubmit = () => {
    if (!date || !supplier) return
    if (itemsList.length === 0) {
      alert('Tambahkan minimal satu barang ke daftar sebelum mengirim.')
      return
    }
    setSubmitting(true)
    const payload: InventoryRequestSubmitPayload = {
      date,
      supplier,
      invoice,
      note: note.trim(),
      items: itemsList,
    }
    navigate('/confirm-inventory-request', { state: payload })
    setSubmitting(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSupplier(e.target.value)
  }

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice(e.target.value)
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

  const isAddDisabled = !itemName || !unit || quantity <= 0 || price <= 0
  const isSubmitDisabled = submitting || !date || !supplier || itemsList.length === 0
  const isCustomItem = !itemId && !!itemName.trim()

  return {
    date,
    supplier,
    invoice,
    note,
    itemName,
    unit,
    quantity,
    price,
    priceInput,
    submitting,
    itemsList,
    groupedItems,
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
    resetItem,
    addToList,
    handleSelectItem,
    isCustomItem,
    isAddDisabled,
    isSubmitDisabled,
  }
}
