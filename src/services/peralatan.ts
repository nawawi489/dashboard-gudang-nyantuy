import { SPV_ENDPOINTS } from '../config'
import { PeralatanItem, PeralatanConfirmData } from '../types'
import { normalizePeralatanList } from '../utils/normalizePeralatan'

export const fetchPeralatanList = async (outlet?: string): Promise<PeralatanItem[]> => {
  try {
    const url = new URL(SPV_ENDPOINTS.GET_PERALATAN_LIST)
    if (outlet) {
      url.searchParams.append('outlet', outlet)
    }
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch peralatan list: ${response.status} ${response.statusText}`)
    }
    const raw = await response.json()
    const normalized: PeralatanItem[] = normalizePeralatanList(raw)
    return normalized
  } catch (error) {
    console.warn('API Error (fetchPeralatanList):', error)
    throw error
  }
}

export const confirmPeralatan = async (data: PeralatanConfirmData): Promise<void> => {
  try {
    const formData = new FormData()
    formData.append('id_pengajuan', data.id_pengajuan)
    formData.append('id_peralatan', data.id_peralatan)
    formData.append('nama_peralatan', data.nama_peralatan)
    formData.append('spesifikasi', data.spesifikasi)
    formData.append('qty', String(data.qty))
    formData.append('jumlah_diterima', String(data.jumlah_diterima))
    formData.append('outlet', data.outlet)
    formData.append('keterangan_spv', data.keterangan_spv)
    formData.append('tanggal_konfirmasi', data.tanggal_konfirmasi)
    formData.append('status', data.status)
    if (data.foto_dokumentasi) {
      formData.append('foto_dokumentasi', data.foto_dokumentasi, data.foto_dokumentasi.name)
    }
    if (data.foto_dokumentasi_nota) {
      formData.append('foto_dokumentasi_nota', data.foto_dokumentasi_nota, data.foto_dokumentasi_nota.name)
    }

    const response = await fetch(SPV_ENDPOINTS.CONFIRM_PERALATAN, { method: 'POST', body: formData })
    if (!response.ok) {
      throw new Error(`Failed to submit confirmation: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.warn('Error confirming peralatan:', error)
    throw error
  }
}
