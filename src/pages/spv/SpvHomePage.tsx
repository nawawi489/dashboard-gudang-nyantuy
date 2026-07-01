import { useNavigate } from 'react-router-dom'
import { ArrowLeft, PackageCheck, ClipboardCheck, Store } from 'lucide-react'
import Footer from '../../components/spv/Footer'
import { useSpvOutlet } from '../../contexts/SpvOutletContext'

const SpvHomePage = () => {
  const { outlet, setOutlet } = useSpvOutlet()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
      <div className="mb-8">
        <button
          onClick={() => navigate('/spv/outlet')}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Ganti Outlet
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Pilih Menu</h1>
        <p className="text-slate-500 mt-1 flex items-center gap-2">
          <Store size={16} />
          Outlet: <span className="font-semibold text-blue-600">{outlet || '-'}</span>
          {outlet && (
            <button
              onClick={() => { setOutlet(''); navigate('/spv/outlet') }}
              className="ml-2 text-xs text-slate-400 hover:text-slate-700 underline"
            >
              ubah
            </button>
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto w-full">
        <button
          onClick={() => navigate('/spv/po')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-200 transition-all group text-left"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
            <PackageCheck size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi PO Masuk</h3>
          <p className="text-slate-500 text-sm">
            Verifikasi barang PO yang tiba di outlet.
          </p>
        </button>

        <button
          onClick={() => navigate('/spv/peralatan')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-teal-200 transition-all group text-left"
        >
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
            <ClipboardCheck size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Peralatan Masuk</h3>
          <p className="text-slate-500 text-sm">
            Verifikasi peralatan yang tiba di outlet.
          </p>
        </button>
      </div>

      <div className="mt-auto pt-6">
        <Footer />
      </div>
    </div>
  )
}

export default SpvHomePage
