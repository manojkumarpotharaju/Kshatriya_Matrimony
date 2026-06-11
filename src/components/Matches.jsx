import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { ChatModal, CallModal } from './Connect'

export default function Matches({ setPage, onLoginClick, onToast }) {
  const { profiles, currentUser, canChat, canCall, sendInterest, hasInterest } = useApp()
  const [gender, setGender] = useState('All')
  const [city, setCity] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [chatWith, setChatWith] = useState(null)
  const [callWith, setCallWith] = useState(null)

  const cities = useMemo(() => ['All', ...new Set(profiles.map(p => p.city.split(',')[0].trim()))], [profiles])

  const filtered = profiles.filter(p =>
    (gender === 'All' || p.gender === gender) &&
    (city === 'All' || p.city.startsWith(city)) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.subCaste.toLowerCase().includes(search.toLowerCase()))
  )

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
          <input placeholder="Search name or sub-caste…" value={search} onChange={e => setSearch(e.target.value)} />
          <select value={gender} onChange={e => setGender(e.target.value)}>
            <option>All</option><option>Female</option><option>Male</option>
          </select>
          <select value={city} onChange={e => setCity(e.target.value)}>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
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
                <div className="match-meta">{p.age} yrs · {p.height} · {p.city}</div>
                <div className="match-sub">{p.subCaste} · {p.gotra}</div>
                <div className="match-meta">{p.profession}</div>
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
              </dl>
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
