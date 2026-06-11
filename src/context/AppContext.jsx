import React, { createContext, useContext, useEffect, useState } from 'react'
import { SEED_PROFILES, PLANS } from '../data/profiles'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const LS = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
  },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} },
}

export const ADMIN_CREDENTIALS = { email: 'admin@kshatriya.com', password: 'admin123' }

export function AppProvider({ children }) {
  const [profiles, setProfiles] = useState(() => LS.get('km_profiles', SEED_PROFILES))
  const [users, setUsers] = useState(() => LS.get('km_users', []))
  const [currentUser, setCurrentUser] = useState(() => LS.get('km_session', null))
  const [offers, setOffers] = useState(() => LS.get('km_offers', [
    { id: 'OF1', title: 'Akshaya Tritiya Special', discount: 20, code: 'SHUBH20', validTill: '2026-06-30', active: true },
  ]))
  const [payments, setPayments] = useState(() => LS.get('km_payments', []))
  const [interests, setInterests] = useState(() => LS.get('km_interests', []))

  useEffect(() => LS.set('km_profiles', profiles), [profiles])
  useEffect(() => LS.set('km_users', users), [users])
  useEffect(() => LS.set('km_session', currentUser), [currentUser])
  useEffect(() => LS.set('km_offers', offers), [offers])
  useEffect(() => LS.set('km_payments', payments), [payments])
  useEffect(() => LS.set('km_interests', interests), [interests])

  // ---- Auth ----
  const register = ({ name, email, password, gender }) => {
    if (users.some(u => u.email === email)) return { ok: false, error: 'An account with this email already exists.' }
    const user = { id: 'U' + Date.now(), name, email, password, gender, plan: null, planExpiry: null, isAdmin: false, joined: new Date().toISOString() }
    setUsers(prev => [...prev, user])
    setCurrentUser(user)
    return { ok: true }
  }

  const login = (email, password) => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const admin = { id: 'ADMIN', name: 'Administrator', email, isAdmin: true, plan: 'platinum' }
      setCurrentUser(admin)
      return { ok: true, admin: true }
    }
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) return { ok: false, error: 'Invalid email or password.' }
    setCurrentUser(user)
    return { ok: true }
  }

  const logout = () => setCurrentUser(null)

  // ---- Subscription / payments ----
  const activeOffer = offers.find(o => o.active && new Date(o.validTill) >= new Date())

  const subscribe = ({ planId, method, details }) => {
    const plan = PLANS.find(p => p.id === planId)
    if (!plan || !currentUser) return { ok: false }
    const discount = activeOffer ? activeOffer.discount : 0
    const amount = Math.round(plan.price * (1 - discount / 100))
    const payment = {
      id: 'PAY' + Date.now(), userId: currentUser.id, userName: currentUser.name,
      planId, amount, method, details: details || {},
      status: method === 'cash' ? 'pending' : 'success',
      offerApplied: discount ? activeOffer.code : null,
      date: new Date().toISOString(),
    }
    setPayments(prev => [payment, ...prev])
    if (payment.status === 'success') activatePlan(currentUser.id, planId)
    return { ok: true, payment }
  }

  const activatePlan = (userId, planId) => {
    const plan = PLANS.find(p => p.id === planId)
    const months = plan.id === 'silver' ? 3 : plan.id === 'gold' ? 6 : 12
    const expiry = new Date(); expiry.setMonth(expiry.getMonth() + months)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: planId, planExpiry: expiry.toISOString() } : u))
    setCurrentUser(prev => prev && prev.id === userId ? { ...prev, plan: planId, planExpiry: expiry.toISOString() } : prev)
  }

  const approveCashPayment = (paymentId) => {
    const pay = payments.find(p => p.id === paymentId)
    if (!pay) return
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'success' } : p))
    activatePlan(pay.userId, pay.planId)
  }

  const userPlan = currentUser?.plan ? PLANS.find(p => p.id === currentUser.plan) : null
  const canChat = !!(currentUser?.isAdmin || userPlan?.chat)
  const canCall = !!(currentUser?.isAdmin || userPlan?.call)

  // ---- Profiles (admin + members) & offers ----
  const addProfile = (profile, { byAdmin = false } = {}) => {
    const id = 'KM' + Date.now().toString().slice(-6)
    const owner = byAdmin ? 'ADMIN' : (currentUser?.id || 'GUEST')
    const newProfile = {
      ...profile, id,
      createdBy: owner,
      verified: byAdmin, // member-added profiles await admin verification
      premium: false,
    }
    setProfiles(prev => [newProfile, ...prev])
    return newProfile
  }
  const updateProfile = (id, patch) => setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  const verifyProfile = (id) => updateProfile(id, { verified: true })
  const removeProfile = (id) => setProfiles(prev => prev.filter(p => p.id !== id))
  const myProfiles = currentUser ? profiles.filter(p => p.createdBy === currentUser.id) : []

  const addOffer = (offer) => setOffers(prev => [{ ...offer, id: 'OF' + Date.now(), active: true }, ...prev])
  const toggleOffer = (id) => setOffers(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o))
  const removeOffer = (id) => setOffers(prev => prev.filter(o => o.id !== id))

  const sendInterest = (profileId) => {
    if (!currentUser) return
    setInterests(prev => prev.some(i => i.userId === currentUser.id && i.profileId === profileId)
      ? prev : [...prev, { userId: currentUser.id, profileId, date: new Date().toISOString() }])
  }
  const hasInterest = (profileId) => !!currentUser && interests.some(i => i.userId === currentUser.id && i.profileId === profileId)

  const value = {
    profiles, users, currentUser, offers, payments, interests, activeOffer,
    PLANS, ADMIN_CREDENTIALS,
    register, login, logout, subscribe, approveCashPayment,
    addProfile, updateProfile, verifyProfile, removeProfile, myProfiles,
    addOffer, toggleOffer, removeOffer,
    sendInterest, hasInterest,
    userPlan, canChat, canCall,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
