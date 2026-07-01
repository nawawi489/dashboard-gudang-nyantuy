import { WEBHOOK_PAYMENT_PROOF, WEBHOOK_STRUK_PEMBELIAN_KASPIN } from '../config'

type PaymentProofMetadata = {
  itemName?: string
  hargaKonversiResep?: number
  jumlahKonversiResep?: number
  satuanKonversiResep?: string
}

export async function submitPaymentProof(
  trxId: string,
  file: File,
  cabang: string,
  nomorInvoice?: string,
  metadata?: PaymentProofMetadata,
): Promise<boolean> {
  const formData = new FormData()
  formData.append('trxId', trxId)
  formData.append('outlet', cabang)
  formData.append('file', file)
  if (nomorInvoice !== undefined) formData.append('nomorInvoice', nomorInvoice)
  if (metadata?.itemName) formData.append('itemName', metadata.itemName)
  if (metadata?.hargaKonversiResep != null) {
    formData.append('hargaKonversiResep', String(metadata.hargaKonversiResep))
  }
  if (metadata?.jumlahKonversiResep != null) {
    formData.append('jumlahKonversiResep', String(metadata.jumlahKonversiResep))
  }
  if (metadata?.satuanKonversiResep) {
    formData.append('satuanKonversiResep', metadata.satuanKonversiResep)
  }

  try {
    const response = await fetch(WEBHOOK_PAYMENT_PROOF, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    throw error
  }
}

export async function submitStrukKaspinProof(
  trxId: string,
  file: File,
  cabang: string,
  nomorInvoice?: string,
  metadata?: PaymentProofMetadata,
): Promise<boolean> {
  const formData = new FormData()
  formData.append('trxId', trxId)
  formData.append('outlet', cabang)
  formData.append('file', file)

  if (nomorInvoice !== undefined) formData.append('nomorInvoice', nomorInvoice)
  if (metadata?.itemName) formData.append('itemName', metadata.itemName)
  if (metadata?.hargaKonversiResep != null) {
    formData.append('hargaKonversiResep', String(metadata.hargaKonversiResep))
  }
  if (metadata?.jumlahKonversiResep != null) {
    formData.append('jumlahKonversiResep', String(metadata.jumlahKonversiResep))
  }
  if (metadata?.satuanKonversiResep) {
    formData.append('satuanKonversiResep', metadata.satuanKonversiResep)
  }

  try {
    const response = await fetch(WEBHOOK_STRUK_PEMBELIAN_KASPIN, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error('Error uploading struk pembelian kaspin:', error)
    throw error
  }
}
