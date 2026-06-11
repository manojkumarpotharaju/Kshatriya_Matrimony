import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Plans({ onLoginClick, onToast }) {
  const { PLANS, currentUser, activeOffer, subscribe, userPlan } = useApp()
  const [paying, setPaying] = useState(null)

  const discounted = (price) => activeOffer ? Math.round(price * (1 - activeOffer.discount / 100)) : price

  const choose = (plan) => {
    if (!currentUser) { onLoginClick(); return }
    if (currentUser.isAdmin) { onToast('Admins already have full access'); return }
    setPaying(plan)
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">Membership</span>
          <h2>Choose your plan</h2>
          <p>
            {activeOffer
              ? <>Offer <b style={{ color: 'var(--maroon)' }}>{activeOffer.code}</b> applied automatically — {activeOffer.discount}% off all plans.</>
              : 'Honest pricing. No hidden charges. Upgrade anytime.'}
          </p>
        </div>

        <div className="plans-grid">
          {PLANS.map(plan => (
            <div className={`plan-card ${plan.popular ? 'popular' : ''}`} key={plan.id}>
              {plan.popular && <span className="plan-pop-tag">Most chosen</span>}
              <h3>{plan.name}</h3>
              <div className="plan-price">
                {activeOffer && <span className="struck">₹{plan.price}</span>}
                ₹{discounted(plan.price)}
              </div>
              <div className="plan-period">for {plan.period}</div>
              <ul className="plan-features">
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <button
                className={`btn ${plan.popular ? 'btn-gold' : 'btn-primary'}`}
                onClick={() => choose(plan)}
                disabled={userPlan?.id === plan.id}>
                {userPlan?.id === plan.id ? '✓ Current plan' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {paying && (
        <PaymentModal plan={paying} onClose={() => setPaying(null)} onToast={onToast}
          activeOffer={activeOffer} subscribe={subscribe} finalAmount={discounted(paying.price)} />
      )}
    </section>
  )
}

function PaymentModal({ plan, onClose, onToast, activeOffer, subscribe, finalAmount }) {
  const [method, setMethod] = useState('card')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [upiId, setUpiId] = useState('')
  const [processing, setProcessing] = useState(false)

  const pay = () => {
    if (method === 'card') {
      if (card.number.replace(/\s/g, '').length < 12 || !card.name || !card.expiry || card.cvv.length < 3) {
        onToast('Please fill all card details'); return
      }
    }
    if (method === 'upi' && !upiId.includes('@')) { onToast('Enter a valid UPI ID, e.g. name@upi'); return }

    setProcessing(true)
    setTimeout(() => {
      const details = method === 'card'
        ? { last4: card.number.slice(-4) }
        : method === 'upi' ? { upiId } : { note: 'Pay at office counter' }
      const res = subscribe({ planId: plan.id, method, details })
      setProcessing(false)
      if (res.ok) {
        onToast(method === 'cash'
          ? 'Booking recorded. Pay cash at our office — admin will activate your plan.'
          : `🎉 ${plan.name} plan activated. Happy matchmaking!`)
        onClose()
      }
    }, 1400)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Checkout — {plan.name}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div className="pay-summary">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{plan.name} plan · {plan.period}</span><span>₹{plan.price}</span>
            </div>
            {activeOffer && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#196e3c' }}>
                <span>Offer {activeOffer.code} (−{activeOffer.discount}%)</span>
                <span>−₹{plan.price - finalAmount}</span>
              </div>
            )}
            <div className="total"><span>Total payable</span><span>₹{finalAmount}</span></div>
          </div>

          <div className="pay-methods" role="tablist">
            {[
              { id: 'card', icon: '💳', label: 'Card' },
              { id: 'upi', icon: '📱', label: 'UPI' },
              { id: 'cash', icon: '🪙', label: 'Cash' },
            ].map(m => (
              <button key={m.id} className={`pay-method ${method === m.id ? 'active' : ''}`} onClick={() => setMethod(m.id)}>
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>

          {method === 'card' && (
            <div className="form-grid">
              <div>
                <label>Card number</label>
                <input placeholder="4242 4242 4242 4242" maxLength={19} value={card.number}
                  onChange={e => setCard(c => ({ ...c, number: e.target.value }))} />
              </div>
              <div>
                <label>Name on card</label>
                <input placeholder="VIKRAM SINGH" value={card.name}
                  onChange={e => setCard(c => ({ ...c, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <div>
                  <label>Expiry</label>
                  <input placeholder="MM/YY" maxLength={5} value={card.expiry}
                    onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))} />
                </div>
                <div>
                  <label>CVV</label>
                  <input placeholder="•••" type="password" maxLength={4} value={card.cvv}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {method === 'upi' && (
            <div className="form-grid" style={{ textAlign: 'center' }}>
              <div className="upi-qr" aria-label="UPI QR code" />
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>Scan with any UPI app, or enter your UPI ID below</p>
              <div>
                <input placeholder="yourname@okhdfcbank" value={upiId} onChange={e => setUpiId(e.target.value)} />
              </div>
            </div>
          )}

          {method === 'cash' && (
            <div className="note-box">
              <b>Pay at office:</b> Kshatriya Matrimony, 3rd Floor, Jubilee Hills, Hyderabad — Mon–Sat, 10 AM to 7 PM.
              Your booking will stay <b>pending</b> until our admin confirms the cash payment, after which
              your plan activates instantly.
            </div>
          )}

          <button className="btn btn-gold" style={{ width: '100%', marginTop: 18 }} onClick={pay} disabled={processing}>
            {processing ? 'Processing…' : method === 'cash' ? `Book plan — pay ₹${finalAmount} at office` : `Pay ₹${finalAmount} securely`}
          </button>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 10 }}>
            Demo checkout — no real money is charged. Integrate Razorpay/Stripe for production.
          </p>
        </div>
      </div>
    </div>
  )
}
