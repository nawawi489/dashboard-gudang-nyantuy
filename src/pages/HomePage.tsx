import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { ROLE_MENUS, ROLE_LABEL, type MenuItem } from '../constants'

export function HomePage() {
  const { logout, role, user } = useAuth()
  const items = useMemo<MenuItem[]>(() => {
    if (!role) return []
    return ROLE_MENUS[role]
  }, [role])

  return (
    <div className="container">
      <Header
        title="Warehouse Nyantuy"
        rightSlot={(
          <button className="user" aria-label="Logout" title="Logout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        )}
      />

      <section className="hero">
        <h1>Menu Utama</h1>
        <p>
          {role
            ? `Login sebagai ${ROLE_LABEL[role]}${user ? ` (${user})` : ''}`
            : 'Pilih modul untuk melanjutkan'}
        </p>
      </section>

      {items.length === 0 ? (
        <section className="hero">
          <p>Belum ada menu untuk role ini.</p>
        </section>
      ) : (
        <section className="grid">
          {items.map((item) => (
            <Link key={item.key} to={item.href} className="card" aria-label={item.title}>
              <div className="card-icon" aria-hidden="true">{item.emoji}</div>
              <div className="card-body">
                <div className="card-title">{item.title}</div>
                <div className="card-subtitle">{item.subtitle}</div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
