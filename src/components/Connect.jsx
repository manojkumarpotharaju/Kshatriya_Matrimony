import React, { useEffect, useRef, useState } from 'react'

const AUTO_REPLIES = [
  'Namaste! Nice to hear from you. 😊',
  'Thank you for reaching out. Tell me a little about your family?',
  'That sounds wonderful. What do you enjoy doing on weekends?',
  'My parents would love to speak with your family sometime.',
  'I appreciate your honesty. Let us keep in touch!',
]

export function ChatModal({ profile, onClose }) {
  const [messages, setMessages] = useState([
    { from: 'them', text: `Hi! This is ${profile.name.split(' ')[0]}. Happy to connect with you here.` },
  ])
  const [input, setInput] = useState('')
  const [replyIdx, setReplyIdx] = useState(0)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMessages(m => [...m, { from: 'me', text }])
    setInput('')
    setTimeout(() => {
      setMessages(m => [...m, { from: 'them', text: AUTO_REPLIES[replyIdx % AUTO_REPLIES.length] }])
      setReplyIdx(i => i + 1)
    }, 900)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>💬 Chat with {profile.name.split(' ')[0]}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div className="chat-window">
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.from === 'me' ? 'chat-me' : 'chat-them'}`}>{m.text}</div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="chat-input">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type a message…" aria-label="Message" />
              <button className="btn btn-primary btn-sm" onClick={send}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CallModal({ profile, onClose }) {
  const [status, setStatus] = useState('ringing') // ringing → connected
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const ring = setTimeout(() => setStatus('connected'), 2500)
    return () => clearTimeout(ring)
  }, [])

  useEffect(() => {
    if (status !== 'connected') return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [status])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-body">
          <div className="call-screen">
            <img src={profile.photo} alt={profile.name} />
            <h3 style={{ fontSize: 22, color: 'var(--maroon-deep)' }}>{profile.name}</h3>
            <div className="call-timer">
              {status === 'ringing' ? 'Ringing…' : fmt(seconds)}
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 18 }}>
              Your number stays private — calls are routed through Kshatriya Matrimony.
            </p>
            <button className="btn call-end" onClick={onClose}>📵 End call</button>
          </div>
        </div>
      </div>
    </div>
  )
}
