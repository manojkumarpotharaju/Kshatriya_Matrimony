import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { PLANS, cityCoords } from '../data/profiles'
import { supabase, supabaseConfigured } from '../lib/supabase'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

// ---- snake_case (DB) <-> camelCase (UI) mappers ----
const profileFromDb = (r) => ({
  id: r.id, createdBy: r.created_by, relation: r.relation, name: r.name, age: r.age,
  gender: r.gender, height: r.height, city: r.city,
  coords: r.lat != null ? { lat: r.lat, lng: r.lng } : cityCoords(r.city),
  subCaste: r.sub_caste, gotra: r.gotra, education: r.education,
  professionCategory: r.profession_category, profession: r.profession, income: r.income,
  family: r.family, about: r.about, diet: r.diet, maritalStatus: r.marital_status,
  horoscope: r.horoscope, photo: r.photo, interests: r.interests || [],
  verified: r.verified, premium: r.premium,
})

const profileToDb = (p) => ({
  relation: p.relation, name: p.name, age: p.age, gender: p.gender, height: p.height,
  city: p.city, lat: p.coords?.lat ?? null, lng: p.coords?.lng ?? null,
  sub_caste: p.subCaste, gotra: p.gotra, education: p.education,
  profession_category: p.professionCategory, profession: p.profession, income: p.income,
  family: p.family, about: p.about, diet: p.diet, marital_status: p.maritalStatus,
  horoscope: p.horoscope, photo: p.photo, interests: p.interests || [],
})

const memberFromDb = (r) => ({
  id: r.id, name: r.name, email: r.email, gender: r.gender,
  plan: r.plan, planExpiry: r.plan_expiry, isAdmin: r.is_admin, joined: r.joined,
})

const paymentFromDb = (r) => ({
  id: r.id, userId: r.user_id, userName: r.user_name, planId: r.plan_id,
  amount: r.amount, method: r.method, details: r.details, status: r.status,
  offerApplied: r.offer_applied, date: r.created_at,
})

export function AppProvider({ children }) {
  const [profiles, setProfiles] = useState([])
  const [users, setUsers] = useState([])           // admin only
  const [currentUser, setCurrentUser] = useState(null)
  const [offers, setOffers] = useState([])
  const [payments, setPayments] = useState([])     // admin only
  const [interestSet, setInterestSet] = useState(new Set())

  // ---- fetchers ----
  const fetchProfiles = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (!error) setProfiles((data || []).map(profileFromDb))
  }, [])

  const fetchOffers = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false })
    if (!error) setOffers((data || []).map(o => ({
      id: o.id, title: o.title, discount: o.discount, code: o.code, validTill: o.valid_till, active: o.active,
    })))
  }, [])

  const fetchAdminData = useCallback(async () => {
    if (!supabase) return
    const [m, p] = await Promise.all([
      supabase.from('members').select('*').order('joined', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
    ])
    if (!m.error) setUsers((m.data || []).map(memberFromDb))
    if (!p.error) setPayments((p.data || []).map(paymentFromDb))
  }, [])

  const loadSession = useCallback(async (authUser) => {
    if (!supabase) return
    if (!authUser) {
      setCurrentUser(null); setUsers([]); setPayments([]); setInterestSet(new Set())
      fetchProfiles()
      return
    }
    const { data: m } = await supabase.from('members').select('*').eq('id', authUser.id).single()
    const member = m ? memberFromDb(m) : null
    setCurrentUser(member)
    const { data: ints } = await supabase.from('interests_sent').select('profile_id').eq('user_id', authUser.id)
    setInterestSet(new Set((ints || []).map(i => i.profile_id)))
    fetchProfiles() // RLS widens visibility for owners/admin
    if (member?.isAdmin) fetchAdminData()
  }, [fetchProfiles, fetchAdminData])

  useEffect(() => {
    if (!supabaseConfigured) return
    fetchOffers()
    fetchProfiles()
    supabase.auth.getSession().then(({ data }) => loadSession(data.session?.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadSession(session?.user || null)
    })
    return () => sub.subscription.unsubscribe()
  }, [fetchOffers, fetchProfiles, loadSession])

  // ---- Auth ----
  const register = async ({ name, email, password, gender }) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name, gender } },
    })
    if (error) return { ok: false, error: error.message }
    if (!data.session) return { ok: true, needsConfirm: true } // email confirmation is ON in Supabase
    return { ok: true }
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    const { data: m } = await supabase.from('members').select('is_admin').eq('id', data.user.id).single()
    return { ok: true, admin: !!m?.is_admin }
  }

  const logout = async () => { await supabase.auth.signOut() }

  // ---- Subscription / payments ----
  const activeOffer = offers.find(o => o.active && new Date(o.validTill) >= new Date())

  const planMonths = (planId) => (planId === 'silver' ? 3 : planId === 'gold' ? 6 : 12)

  const activatePlanFor = async (userId, planId) => {
    const expiry = new Date(); expiry.setMonth(expiry.getMonth() + planMonths(planId))
    await supabase.from('members').update({ plan: planId, plan_expiry: expiry.toISOString() }).eq('id', userId)
    if (currentUser?.id === userId) {
      setCurrentUser(u => u ? { ...u, plan: planId, planExpiry: expiry.toISOString() } : u)
    }
  }

  const subscribe = async ({ planId, method, details }) => {
    const plan = PLANS.find(p => p.id === planId)
    if (!plan || !currentUser) return { ok: false }
    const discount = activeOffer ? activeOffer.discount : 0
    const amount = Math.round(plan.price * (1 - discount / 100))
    const payment = {
      id: 'PAY' + Date.now(),
      user_id: currentUser.id, user_name: currentUser.name,
      plan_id: planId, amount, method, details: details || {},
      status: method === 'cash' ? 'pending' : 'success',
      offer_applied: discount ? activeOffer.code : null,
    }
    const { error } = await supabase.from('payments').insert(payment)
    if (error) return { ok: false, error: error.message }
    if (payment.status === 'success') await activatePlanFor(currentUser.id, planId)
    if (currentUser.isAdmin) fetchAdminData()
    return { ok: true }
  }

  const approveCashPayment = async (paymentId) => {
    const pay = payments.find(p => p.id === paymentId)
    if (!pay) return
    await supabase.from('payments').update({ status: 'success' }).eq('id', paymentId)
    await activatePlanFor(pay.userId, pay.planId)
    fetchAdminData()
  }

  const userPlan = currentUser?.plan ? PLANS.find(p => p.id === currentUser.plan) : null
  const planActive = !!userPlan && (!currentUser.planExpiry || new Date(currentUser.planExpiry) > new Date())
  const canChat = !!(currentUser?.isAdmin || (planActive && userPlan?.chat))
  const canCall = !!(currentUser?.isAdmin || (planActive && userPlan?.call))

  // ---- Profiles (members + admin) ----
  const addProfile = async (profile, { byAdmin = false } = {}) => {
    if (!currentUser) return { ok: false }
    const row = {
      ...profileToDb(profile),
      id: 'KM' + Date.now().toString().slice(-8),
      created_by: currentUser.id,
      verified: byAdmin,            // member-added profiles await verification
      premium: false,
    }
    const { error } = await supabase.from('profiles').insert(row)
    if (error) return { ok: false, error: error.message }
    await fetchProfiles()
    return { ok: true }
  }

  const updateProfile = async (id, patch) => {
    const { error } = await supabase.from('profiles').update(profileToDb(patch)).eq('id', id)
    if (!error) await fetchProfiles()
    return { ok: !error }
  }

  const verifyProfile = async (id) => {
    await supabase.from('profiles').update({ verified: true }).eq('id', id)
    await fetchProfiles()
  }

  const removeProfile = async (id) => {
    await supabase.from('profiles').delete().eq('id', id)
    await fetchProfiles()
  }

  const myProfiles = currentUser ? profiles.filter(p => p.createdBy === currentUser.id) : []

  // ---- Offers (admin) ----
  const addOffer = async (offer) => {
    await supabase.from('offers').insert({
      id: 'OF' + Date.now(), title: offer.title, discount: offer.discount,
      code: offer.code, valid_till: offer.validTill, active: true,
    })
    await fetchOffers()
  }
  const toggleOffer = async (id) => {
    const o = offers.find(x => x.id === id)
    if (!o) return
    await supabase.from('offers').update({ active: !o.active }).eq('id', id)
    await fetchOffers()
  }
  const removeOffer = async (id) => {
    await supabase.from('offers').delete().eq('id', id)
    await fetchOffers()
  }

  // ---- Interests ----
  const sendInterest = async (profileId) => {
    if (!currentUser) return
    await supabase.from('interests_sent').upsert({ user_id: currentUser.id, profile_id: profileId })
    setInterestSet(prev => new Set(prev).add(profileId))
  }
  const hasInterest = (profileId) => interestSet.has(profileId)

  const value = {
    supabaseConfigured,
    profiles, users, currentUser, offers, payments, activeOffer,
    PLANS,
    register, login, logout, subscribe, approveCashPayment,
    addProfile, updateProfile, verifyProfile, removeProfile, myProfiles,
    addOffer, toggleOffer, removeOffer,
    sendInterest, hasInterest,
    userPlan, canChat, canCall,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
