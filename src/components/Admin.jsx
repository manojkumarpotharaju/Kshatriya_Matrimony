import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import ProfileForm from './ProfileForm'
import { postedByLabel } from '../data/profiles'

export default function Admin({ onToast }) {
  const { currentUser } = useApp()
  const [tab, setTab] = useState('overview')

  if (!currentUser?.isAdmin) {
    return (
      <section className="section"><div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--maroon-deep)' }}>Admin access only</h2>
        <p style={{ color: 'var(--ink-soft)' }}>Sign in with an admin account to manage members, profiles, offers and payments.</p>
      </div></section>
    )
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'members', label: '🧑‍🤝‍🧑 Members' },
    { id: 'addProfile', label: '➕ Add profile' },
    { id: 'profiles', label: '👥 Profiles' },
    { id: 'offers', label: '🎁 Offers' },
    { id: 'payments', label: '💰 Payments' },
  ]

  return (
    <section className="section">
      <div className="container">
        <div className="section-head" style={{ marginBottom: 28 }}>
          <span className="section-eyebrow">Control room</span>
          <h2>Admin dashboard</h2>
        </div>
        <div className="admin-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        {tab === 'overview' && <Overview />}
        {tab === 'members' && <Members />}
        {tab === 'addProfile' && <AddProfile onToast={onToast} onDone={() => setTab('profiles')} />}
        {tab === 'profiles' && <ProfilesTable onToast={onToast} />}
        {tab === 'offers' && <Offers onToast={onToast} />}
        {tab === 'payments' && <Payments onToast={onToast} />}
      </div>
    </section>
  )
}

function Overview() {
  const { profiles, users, payments, offers } = useApp()
  const revenue = payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0)
  const pendingCash = payments.filter(p => p.status === 'pending').length
  const pendingProfiles = profiles.filter(p => !p.verified).length
  const premiumMembers = users.filter(u => u.plan).length
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card"><b>{profiles.length}</b><span>Total profiles</span></div>
        <div className="stat-card"><b>{pendingProfiles}</b><span>Awaiting verification</span></div>
        <div className="stat-card"><b>{users.length}</b><span>Registered members</span></div>
        <div className="stat-card"><b>{premiumMembers}</b><span>Paid members</span></div>
        <div className="stat-card"><b>₹{revenue.toLocaleString('en-IN')}</b><span>Revenue</span></div>
        <div className="stat-card"><b>{pendingCash}</b><span>Pending cash payments</span></div>
        <div className="stat-card"><b>{offers.filter(o => o.active).length}</b><span>Live offers</span></div>
      </div>
      <div className="note-box">
        Workflow: new member profiles land in <b>Profiles</b> as "Pending" → click <b>Verify</b> to publish them.
        Cash bookings land in <b>Payments</b> as "Pending cash" → click <b>Approve cash</b> to activate the member's plan.
      </div>
    </>
  )
}

function Members() {
  const { users, profiles, PLANS } = useApp()
  if (!users.length) return <p style={{ color: 'var(--ink-soft)' }}>No registered members yet.</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Gender</th><th>Plan</th><th>Joined</th><th>Profiles created</th></tr></thead>
        <tbody>
          {users.map(u => {
            const owned = profiles.filter(p => p.createdBy === u.id)
            const plan = PLANS.find(pl => pl.id === u.plan)
            return (
              <tr key={u.id}>
                <td>{u.name || '—'}{u.isAdmin && ' 👑'}</td><td>{u.email}</td><td>{u.gender || '—'}</td>
                <td>{plan ? <span className="pill pill-success">{plan.name}</span> : <span className="pill pill-pending">Free</span>}</td>
                <td>{u.joined ? new Date(u.joined).toLocaleDateString('en-IN') : '—'}</td>
                <td>{owned.length ? owned.map(p => `${p.name} (${p.relation || 'Self'})`).join(', ') : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AddProfile({ onToast, onDone }) {
  const { addProfile } = useApp()
  return (
    <ProfileForm onToast={onToast} submitLabel="Add profile (verified)"
      onSubmit={async (data) => {
        const res = await addProfile(data, { byAdmin: true })
        if (!res.ok) { onToast('Failed: ' + (res.error || 'try again')); return }
        onToast(`Profile for ${data.name} added & verified ✦`)
        onDone()
      }} />
  )
}

function ProfilesTable({ onToast }) {
  const { profiles, removeProfile, verifyProfile } = useApp()
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>City</th><th>Posted by</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {profiles.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td><td>{p.name}</td><td>{p.age}</td><td>{p.city}</td>
              <td>{postedByLabel(p.relation).replace('Posted by ', '')}</td>
              <td>{p.verified ? <span className="pill pill-success">Verified</span> : <span className="pill pill-pending">Pending</span>}</td>
              <td style={{ display: 'flex', gap: 6 }}>
                {!p.verified && (
                  <button className="btn btn-primary btn-sm" onClick={async () => { await verifyProfile(p.id); onToast(`${p.name} verified ✓`) }}>Verify</button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={async () => { await removeProfile(p.id); onToast('Profile removed') }}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Offers({ onToast }) {
  const { offers, addOffer, toggleOffer, removeOffer } = useApp()
  const [form, setForm] = useState({ title: '', discount: 10, code: '', validTill: '' })

  const submit = async () => {
    if (!form.title || !form.code || !form.validTill) { onToast('Fill all offer fields'); return }
    await addOffer({ ...form, discount: Number(form.discount), code: form.code.toUpperCase() })
    onToast(`Offer ${form.code.toUpperCase()} is live ✦`)
    setForm({ title: '', discount: 10, code: '', validTill: '' })
  }

  return (
    <>
      <div className="form-grid" style={{ maxWidth: 680, marginBottom: 36 }}>
        <div className="form-row">
          <div><label>Offer title</label><input placeholder="Diwali Dhamaka" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><label>Discount %</label><input type="number" min="1" max="90" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div><label>Promo code</label><input placeholder="DIWALI25" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
          <div><label>Valid till</label><input type="date" value={form.validTill} onChange={e => setForm(f => ({ ...f, validTill: e.target.value }))} /></div>
        </div>
        <button className="btn btn-gold" onClick={submit}>Launch offer</button>
        <div className="note-box">The newest <b>active</b> offer shows in the site banner for every visitor and auto-applies at checkout. Add a fresh offer any day — pause or delete old ones below.</div>
      </div>
      <table className="admin-table">
        <thead><tr><th>Title</th><th>Code</th><th>Discount</th><th>Valid till</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {offers.map(o => (
            <tr key={o.id}>
              <td>{o.title}</td><td><b>{o.code}</b></td><td>{o.discount}%</td>
              <td>{new Date(o.validTill).toLocaleDateString('en-IN')}</td>
              <td>{o.active ? <span className="pill pill-success">Live</span> : <span className="pill pill-pending">Paused</span>}</td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleOffer(o.id)}>{o.active ? 'Pause' : 'Activate'}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => removeOffer(o.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function Payments({ onToast }) {
  const { payments, approveCashPayment } = useApp()
  if (!payments.length) return <p style={{ color: 'var(--ink-soft)' }}>No payments yet. They'll appear here once members subscribe.</p>
  return (
    <table className="admin-table">
      <thead><tr><th>ID</th><th>Member</th><th>Plan</th><th>Amount</th><th>Method</th><th>Offer</th><th>Status</th><th></th></tr></thead>
      <tbody>
        {payments.map(p => (
          <tr key={p.id}>
            <td>{p.id.slice(-6)}</td><td>{p.userName}</td>
            <td style={{ textTransform: 'capitalize' }}>{p.planId}</td>
            <td>₹{p.amount}</td>
            <td style={{ textTransform: 'uppercase' }}>{p.method}</td>
            <td>{p.offerApplied || '—'}</td>
            <td>{p.status === 'success' ? <span className="pill pill-success">Paid</span> : <span className="pill pill-pending">Pending cash</span>}</td>
            <td>
              {p.status === 'pending' && (
                <button className="btn btn-primary btn-sm" onClick={async () => { await approveCashPayment(p.id); onToast('Cash received — plan activated for ' + p.userName) }}>
                  Approve cash
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
