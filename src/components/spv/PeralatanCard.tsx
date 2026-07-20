import { ClipboardCheck, Store, Tag, DollarSign, Layers, Wrench } from 'lucide-react'
import { PeralatanItem } from '../../types'
import { formatRupiah } from '../../utils/formatRupiah'

interface PeralatanCardProps {
  data: PeralatanItem
  onConfirm: (item: PeralatanItem) => void
  isConfirmed?: boolean
  confirmLabel?: string
}

const PeralatanCard = ({ data, onConfirm, isConfirmed, confirmLabel = 'Konfirmasi Peralatan' }: PeralatanCardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full ${isConfirmed ? 'opacity-75 bg-slate-50' : ''}`}>
      <div className={`bg-gradient-to-r ${isConfirmed ? 'from-green-600 to-green-700' : 'from-teal-600 to-teal-700'} px-5 py-3 flex justify-between items-center`}>
        <span className="text-white font-mono text-sm font-semibold tracking-wider opacity-90">{data.id_peralatan || '-'}</span>
        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">{data.id_pengajuan}</span>
      </div>

      <div className="p-5 flex-1 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{data.nama_peralatan}</h3>
            <div className="flex items-center text-sm text-gray-500 gap-1">
              <Store size={14} />
              <span>{data.outlet}</span>
            </div>
          </div>
        </div>

        {data.supplier && (
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Tag size={14} />
            <span>Supplier: {data.supplier}</span>
          </div>
        )}

        {data.spesifikasi ? (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 flex items-start gap-2">
            <Wrench size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
            <span>{data.spesifikasi}</span>
          </div>
        ) : null}

        <hr className="border-gray-100" />

        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
              <Tag size={12} /> Tgl Pengajuan
            </p>
            <p className="font-medium text-gray-800">{data.tanggal_pengajuan}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
              <Layers size={12} /> Qty
            </p>
            <p className="font-medium text-gray-800">{data.qty}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
              <DollarSign size={12} /> Estimasi Biaya
            </p>
            <p className="font-bold text-teal-700">{formatRupiah(data.total_estimasi_biaya)}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => !isConfirmed && onConfirm(data)}
          disabled={isConfirmed}
          aria-label={isConfirmed ? 'Terkonfirmasi' : confirmLabel}
          className={`w-full font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm ${
            isConfirmed
              ? 'bg-green-100 border border-green-200 text-green-700 cursor-default'
              : 'bg-white border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white'
          }`}
        >
          <ClipboardCheck className={`w-4 h-4 ${!isConfirmed && 'group-hover:scale-110'} transition-transform`} />
          {isConfirmed ? 'Terkonfirmasi' : confirmLabel}
        </button>
      </div>
    </div>
  )
}

export default PeralatanCard
