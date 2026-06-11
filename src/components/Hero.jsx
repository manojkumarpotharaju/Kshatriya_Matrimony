import React from 'react'
import { useApp } from '../context/AppContext'

export default function Hero({ setPage, onLoginClick }) {
  const { currentUser, profiles } = useApp()

  return (
    <>
      <header className="hero">
        <div className="container hero-inner">
          <div>
            <span className="hero-eyebrow">Trusted by Kshatriya families since 2020</span>
            <h1>Where noble lineages find <em>worthy companions</em></h1>
            <p>
              Verified profiles from Rajput, Chauhan, Rathore, Sisodia, Solanki and all Kshatriya
              communities across India. Match by gotra, profession and family values — then connect
              over secure chat and calls.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => currentUser ? setPage('matches') : onLoginClick()}>
                Find your match →
              </button>
              <button className="btn btn-outline" style={{ borderColor: 'var(--gold-soft)', color: 'var(--gold-soft)' }}
                onClick={() => setPage('plans')}>
                View plans
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><b>{profiles.length * 1000}+</b><span>Verified profiles</span></div>
              <div className="hero-stat"><b>4,200+</b><span>Marriages arranged</span></div>
              <div className="hero-stat"><b>120+</b><span>Cities covered</span></div>
            </div>
          </div>
          <div className="hero-frame">
            <div className="hero-frame-inner">
              <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80" alt="Indian wedding couple" />
            </div>
            <div className="hero-frame-caption">
              <b>Aaradhya ♥ Vikram</b>
              <span>Matched on Kshatriya Matrimony · Married Feb 2026, Jaipur</span>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Why families trust us</span>
            <h2>Matchmaking with the dignity it deserves</h2>
            <p>Every profile is screened. Every connection is private. Every plan is honest.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="icon">🛡️</div>
              <h3>Verified profiles</h3>
              <p>ID-checked members with family details, gotra and horoscope on record.</p>
            </div>
            <div className="feature-card">
              <div className="icon">💬</div>
              <h3>Secure chat</h3>
              <p>Message your matches privately once you become a Silver member or above.</p>
            </div>
            <div className="feature-card">
              <div className="icon">📞</div>
              <h3>Voice & video calls</h3>
              <p>Gold and Platinum members can talk directly — no numbers shared until you choose.</p>
            </div>
            <div className="feature-card">
              <div className="icon">🪙</div>
              <h3>Flexible payments</h3>
              <p>Pay by card, UPI, or cash at our office. Seasonal offers announced regularly.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
