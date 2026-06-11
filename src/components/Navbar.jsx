import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Navbar({ page, setPage, onLoginClick }) {
  const { currentUser, logout, activeOffer, userPlan } = useApp()
  const [open, setOpen] = useState(false)

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'matches', label: 'Matches' },
    { id: 'plans', label: 'Plans' },
  ]
  if (currentUser && !currentUser.isAdmin) links.push({ id: 'myprofiles', label: 'My Profiles' })
  if (currentUser?.isAdmin) links.push({ id: 'admin', label: 'Admin' })

  const go = (id) => { setPage(id); setOpen(false) }

  return (
    <>
      {activeOffer && (
        <div className="offer-banner">
          ✦ <b>{activeOffer.title}</b> — flat <b>{activeOffer.discount}% off</b> on all plans. Use code
          <span className="offer-code">{activeOffer.code}</span>
          valid till {new Date(activeOffer.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ✦
        </div>
      )}
      <nav className="navbar">
        <div className="container nav-inner">
          <div className="brand" onClick={() => go('home')}>
            <div className="brand-crest">🛡️</div>
            <div>
              <div className="brand-name">Kshatriya Matrimony</div>
              <div className="brand-tag">Alliances of Honour</div>
            </div>
          </div>
          <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Menu">☰</button>
          <div className={`nav-links ${open ? 'open' : ''}`}>
            {links.map(l => (
              <button key={l.id} className={`nav-link ${page === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
                {l.label}
              </button>
            ))}
            {currentUser ? (
              <>
                {userPlan && <span className="plan-chip">{userPlan.name} member</span>}
                <span className="nav-link" style={{ cursor: 'default' }}>Hi, {currentUser.name.split(' ')[0]}</span>
                <button className="btn btn-outline btn-sm" onClick={() => { logout(); go('home') }}>Sign out</button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={onLoginClick}>Sign in / Register</button>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
