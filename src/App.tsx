import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SpvOutletProvider, useSpvOutlet } from './contexts/SpvOutletContext'
import LoginPage from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import PurchaseRequestPage from './pages/PurchaseRequestPage'
import VendorPage from './pages/VendorPage'
import ApprovalPage from './pages/ApprovalPage'
import ReportPage from './pages/ReportPage'
import SettingsPage from './pages/SettingsPage'
import ConfirmPOPage from './pages/ConfirmPOPage'
import POSuccessPage from './pages/POSuccessPage'
import BillPOPage from './pages/BillPOPage'
import StrukPage from './pages/StrukPage'
import InventoryRequestPage from './pages/InventoryRequestPage'
import ConfirmInventoryRequestPage from './pages/ConfirmInventoryRequestPage'
import InventoryRequestSuccessPage from './pages/InventoryRequestSuccessPage'
import InventoryApprovalPage from './pages/InventoryApprovalPage'
import Footer from './components/Footer'
import { ROUTE_ROLES } from './constants'

import OutletSelectorPage from './pages/spv/OutletSelectorPage'
import SpvHomePage from './pages/spv/SpvHomePage'
import PODashboardPage from './pages/spv/PODashboardPage'
import PeralatanDashboardPage from './pages/spv/PeralatanDashboardPage'

function ProtectedLayout() {
  const { isAuthenticated, isInitialized } = useAuth()
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="container">
        <section className="hero">
          <h1>Memuat sesi</h1>
          <p>Harap tunggu sebentar…</p>
        </section>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <>
      <Outlet />
      <Footer />
    </>
  )
}

// Guard tambahan: cek apakah role user termasuk yang diizinkan untuk path ini.
// Route yang tidak ada di ROUTE_ROLES dianggap boleh diakses semua role.
function RoleGuard() {
  const { role } = useAuth()
  const location = useLocation()

  const allowedRoles = ROUTE_ROLES[location.pathname]
  if (!allowedRoles) return <Outlet />
  if (role && allowedRoles.includes(role)) return <Outlet />

  return <Navigate to="/" replace />
}

// Guard khusus SPV: memastikan outlet sudah dipilih sebelum masuk
// halaman SPV (kecuali OutletSelectorPage itu sendiri).
function SpvOutletGuard() {
  const { isOutletSelected } = useSpvOutlet()
  const location = useLocation()
  if (location.pathname === '/spv/outlet') return <Outlet />
  if (isOutletSelected) return <Outlet />
  return <Navigate to="/spv/outlet" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <SpvOutletProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedLayout />}>
            <Route element={<RoleGuard />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/pr" element={<PurchaseRequestPage />} />
              <Route path="/vendor" element={<VendorPage />} />
              <Route path="/approval" element={<ApprovalPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/bill" element={<BillPOPage />} />
              <Route path="/struk" element={<StrukPage />} />
              <Route path="/confirm-po" element={<ConfirmPOPage />} />
              <Route path="/po-success" element={<POSuccessPage />} />
              <Route path="/inventory-request" element={<InventoryRequestPage />} />
              <Route path="/confirm-inventory-request" element={<ConfirmInventoryRequestPage />} />
              <Route path="/inventory-request-success" element={<InventoryRequestSuccessPage />} />
              <Route path="/approval-inventory" element={<InventoryApprovalPage />} />

              <Route element={<SpvOutletGuard />}>
                <Route path="/spv/outlet" element={<OutletSelectorPage />} />
                <Route path="/spv/home" element={<SpvHomePage />} />
                <Route path="/spv/po" element={<PODashboardPage />} />
                <Route path="/spv/peralatan" element={<PeralatanDashboardPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </SpvOutletProvider>
    </AuthProvider>
  )
}
