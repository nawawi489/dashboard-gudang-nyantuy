import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Username dan password wajib diisi')
      return
    }

    const inputUser = username.trim()
    const inputPass = password.trim()

    const result = login(inputUser, inputPass)
    if (!result) {
      setError('Username atau password salah')
      return
    }

    navigate('/')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#f3f4f6' 
    }}>
      <div style={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div className="panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--primary)' }}>Warehouse Nyantuy</h1>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>Silakan login untuk melanjutkan</p>
          </div>

          <form onSubmit={handleLogin} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="control">
              <label className="label">Username</label>
              <input 
                type="text" 
                className="input" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username"
              />
            </div>
            <div className="control">
              <label className="label">Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="input password-input" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Login
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
