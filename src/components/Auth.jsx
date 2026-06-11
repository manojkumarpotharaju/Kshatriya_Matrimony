import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function AuthModal({ onClose, onToast }) {
  const { login, register } = useApp()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', gender: 'Male' })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = () => {
    setError('')
    if (!form.email || !form.password) { setError('Email and password are required.'); return }
    if (mode === 'register' && !form.name) { setError('Please enter your full name.'); return }
    const res = mode === 'login' ? login(form.email, form.password) : register(form)
    if (!res.ok) { setError(res.error); return }
    onToast(res.admin ? 'Welcome, Administrator' : mode === 'login' ? 'Welcome back!' : 'Account created. Welcome to the family!')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{mode === 'login' ? 'Sign in' : 'Create your profile'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            {mode === 'register' && (
              <>
                <div>
                  <label>Full name</label>
                  <input value={form.name} onChange={set('name')} placeholder="e.g. Vikram Singh" />
                </div>
                <div>
                  <label>Profile for</label>
                  <select value={form.gender} onChange={set('gender')}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>
            <div>
              <label>Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
            {error && <div className="note-box" style={{ borderColor: '#c0392b', background: '#fdecea', color: '#c0392b' }}>{error}</div>}
            <button className="btn btn-primary" onClick={submit}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}>
              {mode === 'login' ? "New here? Create a free account" : 'Already a member? Sign in'}
            </button>
            <div className="note-box">
              Admin demo login — email: <b>admin@kshatriya.com</b>, password: <b>admin123</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
