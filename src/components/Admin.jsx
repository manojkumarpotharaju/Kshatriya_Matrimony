import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Admin({ onToast }) {
  const { currentUser } = useApp()
  const [tab, setTab] = useState('overview')

  if (!currentUser?.isAdmin) {
    return (
      <section className="section"><div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--maroon-deep)' }}>Admin access only</h2>
        <p style={{ color: 'var(--ink-soft)' }}>Sign in with the admin account to manage profiles, offers and payments.</p>
      </div></section>
    )
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
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
  const premiumMembers = users.filter(u => u.plan).length
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card"><b>{profiles.length}</b><span>Total profiles</span></div>
        <div className="stat-card"><b>{users.length}</b><span>Registered users</span></div>
        <div className="stat-card"><b>{premiumMembers}</b><span>Paid members</span></div>
        <div className="stat-card"><b>₹{revenue.toLocaleString('en-IN')}</b><span>Revenue</span></div>
        <div className="stat-card"><b>{pendingCash}</b><span>Pending cash payments</span></div>
        <div className="stat-card"><b>{offers.filter(o => o.active).length}</b><span>Live offers</span></div>
      </div>
      <div className="note-box">
        Tip: pending <b>cash</b> payments must be approved in the Payments tab before the member's plan activates.
      </div>
    </>
  )
}

function AddProfile({ onToast, onDone }) {
  const { addProfile } = useApp()
  const empty = {
    name: '', age: '', gender: 'Female', height: '', city: '', subCaste: '', gotra: 'Suryavanshi',
    education: '', profession: '', income: '', family: '', about: '',
    diet: 'Vegetarian', maritalStatus: 'Never Married', horoscope: 'Available on request', photo: '',
  }
  const [form, setForm] = useState(empty)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = () => {
    if (!form.name || !form.age || !form.city) { onToast('Name, age and city are required'); return }
    const photo = form.photo || `https://randomuser.me/api/portraits/${form.gender === 'Female' ? 'women' : 'men'}/${Math.floor(Math.random() * 90)}.jpg`
    addProfile({ ...form, age: Number(form.age), photo })
    onToast(`Profile for ${form.name} added ✦`)
    setForm(empty)
    onDone()
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="form-grid">
        <div className="form-row">
          <div><label>Full name *</label><input value={form.name} onChange={set('name')} /></div>
          <div><label>Age *</label><input type="number" min="18" value={form.age} onChange={set('age')} /></div>
        </div>
        <div className="form-row">
          <div><label>Gender</label>
            <select value={form.gender} onChange={set('gender')}><option>Female</option><option>Male</option></select>
          </div>
          <div><label>Height</label><input placeholder={`5'6"`} value={form.height} onChange={set('height')} /></div>
        </div>
        <div className="form-row">
          <div><label>City *</label><input placeholder="Hyderabad, Telangana" value={form.city} onChange={set('city')} /></div>
          <div><label>Sub-caste</label><input placeholder="Rajput / Chauhan / Rathore…" value={form.subCaste} onChange={set('subCaste')} /></div>
        </div>
        <div className="form-row">
          <div><label>Gotra</label>
            <select value={form.gotra} onChange={set('gotra')}>
              <option>Suryavanshi</option><option>Chandravanshi</option><option>Agnivanshi</option><option>Nagvanshi</option>
            </select>
          </div>
          <div><label>Diet</label>
            <select value={form.diet} onChange={set('diet')}>
              <option>Vegetarian</option><option>Non-Vegetarian</option><option>Eggetarian</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div><label>Education</label><input value={form.education} onChange={set('education')} /></div>
          <div><label>Profession</label><input value={form.profession} onChange={set('profession')} /></div>
        </div>
        <div className="form-row">
          <div><label>Annual income</label><input placeholder="₹12 LPA" value={form.income} onChange={set('income')} /></div>
          <div><label>Photo URL (optional)</label><input placeholder="Leave blank for auto photo" value={form.photo} onChange={set('photo')} /></div>
        </div>
        <div><label>Family details</label><input value={form.family} onChange={set('family')} /></div>
        <div><label>About</label><textarea rows="3" value={form.about} onChange={set('about')} /></div>
        <button className="btn btn-primary" onClick={submit}>Add profile</button>
      </div>
    </div>
  )
}

function ProfilesTable({ onToast }) {
  const { profiles, removeProfile } = useApp()
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>City</th><th>Sub-caste</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {profiles.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td><td>{p.name}</td><td>{p.age}</td><td>{p.city}</td><td>{p.subCaste}</td>
              <td>{p.verified ? <span className="pill pill-success">Verified</span> : <span className="pill pill-pending">Pending</span>}</td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => { removeProfile(p.id); onToast('Profile removed') }}>Remove</button></td>
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

  const submit = () => {
    if (!form.title || !form.code || !form.validTill) { onToast('Fill all offer fields'); return }
    addOffer({ ...form, discount: Number(form.discount), code: form.code.toUpperCase() })
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
        <div className="note-box">The newest <b>active</b> offer is shown in the site banner and auto-applied at checkout. Add a fresh offer any day — yesterday's can be paused or removed below.</div>
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
                <button className="btn btn-primary btn-sm" onClick={() => { approveCashPayment(p.id); onToast('Cash received — plan activated for ' + p.userName) }}>
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
