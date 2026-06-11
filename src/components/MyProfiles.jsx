import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import ProfileForm from './ProfileForm'
import { postedByLabel } from '../data/profiles'

export default function MyProfiles({ onToast, onLoginClick }) {
  const { currentUser, myProfiles, addProfile, updateProfile, removeProfile } = useApp()
  const [mode, setMode] = useState('list')
  const [editing, setEditing] = useState(null)

  if (!currentUser) {
    return (
      <section className="section"><div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--maroon-deep)' }}>Sign in to manage profiles</h2>
        <p style={{ color: 'var(--ink-soft)', margin: '10px 0 20px' }}>
          Create a profile for yourself — or on behalf of your son, daughter or sibling.
        </p>
        <button className="btn btn-primary" onClick={onLoginClick}>Sign in / Register</button>
      </div></section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head" style={{ marginBottom: 30 }}>
          <span className="section-eyebrow">Your family's profiles</span>
          <h2>My profiles</h2>
          <p>Create profiles for yourself or on behalf of family members. New profiles show as "Pending" until our team verifies them — then they appear in everyone's matches.</p>
        </div>

        {mode === 'list' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 34 }}>
              <button className="btn btn-gold" onClick={() => setMode('add')}>➕ Create a new profile</button>
            </div>
            {myProfiles.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                No profiles yet. Create the first one — it takes two minutes.
              </p>
            ) : (
              <div className="matches-grid">
                {myProfiles.map(p => (
                  <article className="match-card" key={p.id}>
                    <div className="match-photo">
                      <div className="match-badges">
                        {p.verified
                          ? <span className="badge badge-verified">✓ Verified</span>
                          : <span className="badge" style={{ background: '#a87a1f' }}>⏳ Pending review</span>}
                      </div>
                      <img src={p.photo} alt={p.name} />
                    </div>
                    <div className="match-body">
                      <h3>{p.name}</h3>
                      <div className="match-meta">{p.age} yrs · {p.city}</div>
                      <div className="match-sub">{postedByLabel(p.relation)}</div>
                      <div className="match-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(p); setMode('edit') }}>Edit</button>
                        <button className="btn btn-ghost btn-sm"
                          onClick={async () => { await removeProfile(p.id); onToast('Profile deleted') }}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {mode === 'add' && (
          <>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => setMode('list')}>← Back</button>
            <ProfileForm onToast={onToast} submitLabel="Create profile"
              onSubmit={async (data) => {
                const res = await addProfile(data)
                if (!res.ok) { onToast('Failed to save: ' + (res.error || 'try again')); return }
                onToast(`Profile for ${data.name} created — pending verification ✦`)
                setMode('list')
              }} />
          </>
        )}

        {mode === 'edit' && editing && (
          <>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => setMode('list')}>← Back</button>
            <ProfileForm initial={editing} onToast={onToast} submitLabel="Save changes"
              onSubmit={async (data) => {
                const res = await updateProfile(editing.id, data)
                if (!res.ok) { onToast('Failed to update — try again'); return }
                onToast('Profile updated ✦')
                setMode('list'); setEditing(null)
              }} />
          </>
        )}
      </div>
    </section>
  )
}
