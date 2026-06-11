import React, { useEffect, useState } from 'react'
import { useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Matches from './components/Matches'
import Plans from './components/Plans'
import Admin from './components/Admin'
import MyProfiles from './components/MyProfiles'
import AuthModal from './components/Auth'

export default function App() {
  const { currentUser, supabaseConfigured } = useApp()
  const [page, setPage] = useState('home')
  const [showAuth, setShowAuth] = useState(false)
  const [toast, setToast] = useState(null)

  const onToast = (msg) => setToast(msg)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => { window.scrollTo({ top: 0 }) }, [page])

  return (
    <>
      {!supabaseConfigured && (
        <div className="offer-banner" style={{ background: '#c0392b', color: '#fff' }}>
          ⚠️ Database not connected — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see SUPABASE_SETUP.md)
        </div>
      )}
      <Navbar page={page} setPage={setPage} onLoginClick={() => setShowAuth(true)} />

      {page === 'home' && <Hero setPage={setPage} onLoginClick={() => setShowAuth(true)} />}
      {page === 'matches' && <Matches setPage={setPage} onLoginClick={() => setShowAuth(true)} onToast={onToast} />}
      {page === 'plans' && <Plans onLoginClick={() => setShowAuth(true)} onToast={onToast} />}
      {page === 'myprofiles' && <MyProfiles onToast={onToast} onLoginClick={() => setShowAuth(true)} />}
      {page === 'admin' && <Admin onToast={onToast} />}

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h4>🛡️ Kshatriya Matrimony</h4>
              <p>
                A trusted matchmaking platform for the Kshatriya community — bringing together
                Rajput, Chauhan, Rathore, Sisodia, Solanki, Parmar and allied families with
                verified profiles, privacy-first chat and honest pricing.
              </p>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                <li><button className="nav-link" style={{ padding: 0 }} onClick={() => setPage('matches')}>Browse matches</button></li>
                <li><button className="nav-link" style={{ padding: 0 }} onClick={() => setPage('plans')}>Membership plans</button></li>
                {currentUser && !currentUser.isAdmin && <li><button className="nav-link" style={{ padding: 0 }} onClick={() => setPage('myprofiles')}>My profiles</button></li>}
                {currentUser?.isAdmin && <li><button className="nav-link" style={{ padding: 0 }} onClick={() => setPage('admin')}>Admin dashboard</button></li>}
              </ul>
            </div>
            <div>
              <h4>Office</h4>
              <ul>
                <li>3rd Floor, Jubilee Hills</li>
                <li>Hyderabad, Telangana</li>
                <li>Mon–Sat · 10 AM – 7 PM</li>
                <li>support@kshatriyamatrimony.in</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} Kshatriya Matrimony · Made with ♥ for the community
          </div>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onToast={onToast} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
