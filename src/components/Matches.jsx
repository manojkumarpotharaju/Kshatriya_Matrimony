import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { ChatModal, CallModal } from './Connect'
import { CITIES, INTERESTS, PROFESSION_CATEGORIES, cityCoords, distanceKm, postedByLabel } from '../data/profiles'

export default function Matches({ setPage, onLoginClick, onToast }) {
  const { profiles, currentUser, canChat, canCall, sendInterest, hasInterest } = useApp()
  const [filters, setFilters] = useState({
    search: '', gender: 'All', ageMin: '', ageMax: '',
    profession: 'All', interest: 'All', nearCity: 'All', radius: 'Any',
  })
  const set = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }))
  const [selected, setSelected] = useState(null)
  const [chatWith, setChatWith] = useState(null)
  const [callWith, setCallWith] = useState(null)

  const visible = useMemo(() => profiles.filter(p => p.verified || p.createdBy === currentUser?.id || currentUser?.isAdmin), [profiles, currentUser])

  const nearCoords = filters.nearCity !== 'All' ? cityCoords(filters.nearCity) : null

  const filtered = visible.filter(p => {
    const q = filters.search.toLowerCase()
    if (q && !(p.name.toLowerCase().includes(q) || (p.subCaste || '').toLowerCase().includes(q) || (p.profession || '').toLowerCase().includes(q))) return false
    if (filters.gender !== 'All' && p.gender !== filters.gender) return false
    if (filters.ageMin && p.age < Number(filters.ageMin)) return false
    if (filters.ageMax && p.age > Number(filters.ageMax)) return false
    if (filters.profession !== 'All' && p.professionCategory !== filters.profession) return false
    if (filters.interest !== 'All' && !(p.interests || []).includes(filters.interest)) return false
    if (nearCoords && filters.radius !== 'Any') {
      const d = distanceKm(nearCoords, p.coords || cityCoords(p.city))
      if (d === null || d > Number(filters.radius)) return false
    }
    return true
  }).map(p => ({
    ...p,
    _distance: nearCoords ? distanceKm(nearCoords, p.coords || cityCoords(p.city)) : null,
  })).sort((a, b) => (a._distance ?? 1e9) - (b._distance ?? 1e9))

  const requirePlan = (action, profile) => {
    if (!currentUser) { onLoginClick(); return }
    if (action === 'chat') {
      if (canChat) setChatWith(profile)
      else { onToast('Chat is available on Silver plan & above'); setPage('plans') }
    }
    if (action === 'call') {
      if (canCall) setCallWith(profile)
      else { onToast('Calls are available on Gold plan & above'); setPage('plans') }
    }
  }

  const interest = (p) => {
    if (!currentUser) { onLoginClick(); return }
    sendInterest(p.id)
    onToast(`Interest sent to ${p.name.split(' ')[0]} ✦`)
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">Handpicked for you</span>
          <h2>Browse matches</h2>
          <p>{filtered.length} profiles matching your filters</p>
        </div>

        <div className="filters">
          <input placeholder="Search name, caste or profession…" value={filters.search} onChange={set('search')} />
          <select value={filters.gender} onChange={set('gender')} aria-label="Gender">
            <option>All</option><option>Female</option><option>Male</option>
          </select>
          <select value={filters.ageMin} onChange={set('ageMin')} aria-label="Minimum age" style={{ minWidth: 110 }}>
            <option value="">Age from</option>
            {[18, 21, 24, 27, 30, 33, 36, 40].map(a => <option key={a} value={a}>{a}+</option>)}
          </select>
          <select value={filters.ageMax} onChange={set('ageMax')} aria-label="Maximum age" style={{ minWidth: 110 }}>
            <option value="">Age to</option>
            {[24, 27, 30, 33, 36, 40, 45, 50].map(a => <option key={a} value={a}>up to {a}</option>)}
          </select>
          <select value={filters.profession} onChange={set('profession')} aria-label="Profession">
            <option value="All">All professions</option>
            {PROFESSION_CATEGORIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={filters.interest} onChange={set('interest')} aria-label="Interest">
            <option value="All">Any interest</option>
            {INTERESTS.map(i => <option key={i}>{i}</option>)}
          </select>
          <select value={filters.nearCity} onChange={set('nearCity')} aria-label="Near city">
            <option value="All">Anywhere in India</option>
            {CITIES.map(c => <option key={c.name} value={c.name}>Near {c.name.split(',')[0]}</option>)}
          </select>
          {filters.nearCity !== 'All' && (
            <select value={filters.radius} onChange={set('radius')} aria-label="Distance" style={{ minWidth: 130 }}>
              <option value="Any">Any distance</option>
              <option value="50">Within 50 km</option>
              <option value="100">Within 100 km</option>
              <option value="250">Within 250 km</option>
              <option value="500">Within 500 km</option>
              <option value="1000">Within 1000 km</option>
            </select>
          )}
        </div>

        <div className="matches-grid">
          {filtered.map(p => (
            <article className="match-card" key={p.id}>
              <div className="match-photo">
                <div className="match-badges">
                  {p.verified && <span className="badge badge-verified">✓ Verified</span>}
                  {p.premium && <span className="badge badge-premium">★ Premium</span>}
                </div>
                <img src={p.photo} alt={p.name} loading="lazy" />
              </div>
              <div className="match-body">
                <h3>{p.name}</h3>
                <div className="match-meta">
                  {p.age} yrs · {p.height} · {p.city}
                  {p._distance !== null && p._distance !== undefined && <> · <b style={{ color: 'var(--gold)' }}>{p._distance} km away</b></>}
                </div>
                <div className="match-sub">{p.subCaste} · {p.gotra}</div>
                <div className="match-meta">{p.profession}</div>
                <div className="match-meta" style={{ fontSize: 12, color: 'var(--gold)' }}>✦ {postedByLabel(p.relation)}</div>
                <div className="match-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => setSelected(p)}>View profile</button>
                  <button className="btn btn-outline btn-sm" onClick={() => interest(p)} disabled={hasInterest(p.id)}>
                    {hasInterest(p.id) ? '✦ Sent' : '♥ Interest'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <ProfileDetail profile={selected} onClose={() => setSelected(null)}
          locked={!currentUser}
          onChat={() => requirePlan('chat', selected)}
          onCall={() => requirePlan('call', selected)}
          onLogin={onLoginClick}
          canChat={canChat} canCall={canCall} setPage={setPage} />
      )}
      {chatWith && <ChatModal profile={chatWith} onClose={() => setChatWith(null)} />}
      {callWith && <CallModal profile={callWith} onClose={() => setCallWith(null)} />}
    </section>
  )
}

function ProfileDetail({ profile: p, onClose, locked, onChat, onCall, onLogin, canChat, canCall, setPage }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{p.name} <span style={{ fontSize: 14, color: 'var(--gold)' }}>· {p.id}</span></h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div className="profile-detail">
            <img src={p.photo} alt={p.name} />
            <div>
              <dl className="detail-rows">
                <div><dt>Age / Height</dt><dd>{p.age} yrs · {p.height}</dd></div>
                <div><dt>Sub-caste</dt><dd>{p.subCaste}</dd></div>
                <div><dt>Gotra</dt><dd>{p.gotra}</dd></div>
                <div><dt>City</dt><dd>{p.city}</dd></div>
                <div><dt>Education</dt><dd>{p.education}</dd></div>
                <div className={locked ? 'detail-locked' : ''}><dt>Profession</dt><dd>{p.profession}</dd></div>
                <div className={locked ? 'detail-locked' : ''}><dt>Income</dt><dd>{p.income}</dd></div>
                <div className={locked ? 'detail-locked' : ''}><dt>Family</dt><dd>{p.family}</dd></div>
                <div><dt>Diet</dt><dd>{p.diet}</dd></div>
                <div><dt>Horoscope</dt><dd>{p.horoscope}</dd></div>
                <div><dt>Posted by</dt><dd>{postedByLabel(p.relation).replace('Posted by ', '')}</dd></div>
              </dl>
              {(p.interests || []).length > 0 && (
                <div className="chips" style={{ marginTop: 12 }}>
                  {p.interests.map(i => <span key={i} className="chip chip-static">{i}</span>)}
                </div>
              )}
              <p style={{ marginTop: 14, fontSize: 14.5, color: 'var(--ink-soft)', fontStyle: 'italic' }}>"{p.about}"</p>

              {locked ? (
                <div className="lock-note">
                  🔒 Sign in to view full profile details, family information and income.
                  <div style={{ marginTop: 10 }}>
                    <button className="btn btn-primary btn-sm" onClick={onLogin}>Sign in / Register free</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={onChat}>
                    💬 Chat {!canChat && '🔒'}
                  </button>
                  <button className="btn btn-gold" onClick={onCall}>
                    📞 Call {!canCall && '🔒'}
                  </button>
                  {(!canChat || !canCall) && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { onClose(); setPage('plans') }}>
                      Unlock with a plan →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
