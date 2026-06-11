import React, { useState } from 'react'
import { CITIES, INTERESTS, PROFESSION_CATEGORIES, RELATIONS, cityCoords } from '../data/profiles'

const EMPTY = {
  relation: 'Myself', name: '', age: '', gender: 'Female', height: '',
  city: CITIES[0].name, subCaste: '', gotra: 'Suryavanshi',
  education: '', professionCategory: PROFESSION_CATEGORIES[0], profession: '', income: '',
  family: '', about: '', diet: 'Vegetarian', maritalStatus: 'Never Married',
  horoscope: 'Available on request', photo: '', interests: [],
}

export default function ProfileForm({ initial, onSubmit, submitLabel = 'Save profile', onToast }) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const setRelation = (e) => {
    const relation = e.target.value
    setForm(f => ({
      ...f, relation,
      // sensible default gender when creating for son/daughter/brother/sister
      gender: relation === 'Son' || relation === 'Brother' ? 'Male'
        : relation === 'Daughter' || relation === 'Sister' ? 'Female' : f.gender,
    }))
  }

  const toggleInterest = (i) => setForm(f => ({
    ...f,
    interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i],
  }))

  const submit = () => {
    if (!form.name || !form.age || !form.city) { onToast('Name, age and city are required'); return }
    if (Number(form.age) < 18) { onToast('Age must be 18 or above'); return }
    const photo = form.photo || `https://randomuser.me/api/portraits/${form.gender === 'Female' ? 'women' : 'men'}/${Math.floor(Math.random() * 90)}.jpg`
    onSubmit({ ...form, age: Number(form.age), photo, coords: cityCoords(form.city) })
  }

  return (
    <div className="form-grid" style={{ maxWidth: 700 }}>
      <div className="form-row">
        <div>
          <label>This profile is for</label>
          <select value={form.relation} onChange={setRelation}>
            {RELATIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label>Gender</label>
          <select value={form.gender} onChange={set('gender')}><option>Female</option><option>Male</option></select>
        </div>
      </div>
      {form.relation !== 'Myself' && (
        <div className="note-box">
          You're creating this profile on behalf of your <b>{form.relation.toLowerCase()}</b>.
          It will show as "{form.relation === 'Son' || form.relation === 'Daughter' ? 'Posted by Parent'
            : form.relation === 'Brother' || form.relation === 'Sister' ? 'Posted by Sibling'
            : `Posted by ${form.relation}`}" to other members.
        </div>
      )}
      <div className="form-row">
        <div><label>Full name *</label><input value={form.name} onChange={set('name')} placeholder="e.g. Aaradhya Singh" /></div>
        <div><label>Age *</label><input type="number" min="18" value={form.age} onChange={set('age')} /></div>
      </div>
      <div className="form-row">
        <div><label>Height</label><input placeholder={`5'6"`} value={form.height} onChange={set('height')} /></div>
        <div>
          <label>City *</label>
          <select value={form.city} onChange={set('city')}>
            {CITIES.map(c => <option key={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div><label>Sub-caste</label><input placeholder="Rajput / Chauhan / Rathore…" value={form.subCaste} onChange={set('subCaste')} /></div>
        <div>
          <label>Gotra</label>
          <select value={form.gotra} onChange={set('gotra')}>
            <option>Suryavanshi</option><option>Chandravanshi</option><option>Agnivanshi</option><option>Nagvanshi</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>Profession category</label>
          <select value={form.professionCategory} onChange={set('professionCategory')}>
            {PROFESSION_CATEGORIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div><label>Job title / role</label><input placeholder="Senior Software Engineer, Microsoft" value={form.profession} onChange={set('profession')} /></div>
      </div>
      <div className="form-row">
        <div><label>Education</label><input value={form.education} onChange={set('education')} /></div>
        <div><label>Annual income</label><input placeholder="₹12 LPA" value={form.income} onChange={set('income')} /></div>
      </div>
      <div className="form-row">
        <div>
          <label>Diet</label>
          <select value={form.diet} onChange={set('diet')}>
            <option>Vegetarian</option><option>Non-Vegetarian</option><option>Eggetarian</option>
          </select>
        </div>
        <div>
          <label>Marital status</label>
          <select value={form.maritalStatus} onChange={set('maritalStatus')}>
            <option>Never Married</option><option>Divorced</option><option>Widowed</option>
          </select>
        </div>
      </div>
      <div>
        <label>Interests & hobbies</label>
        <div className="chips">
          {INTERESTS.map(i => (
            <button type="button" key={i}
              className={`chip ${form.interests.includes(i) ? 'chip-active' : ''}`}
              onClick={() => toggleInterest(i)}>
              {i}
            </button>
          ))}
        </div>
      </div>
      <div><label>Family details</label><input placeholder="Father — Businessman, Mother — Teacher, 1 sister" value={form.family} onChange={set('family')} /></div>
      <div><label>About</label><textarea rows="3" value={form.about} onChange={set('about')} placeholder="A few lines about personality, values and partner expectations…" /></div>
      <div><label>Photo URL (optional — auto photo if blank)</label><input value={form.photo} onChange={set('photo')} /></div>
      <button className="btn btn-primary" onClick={submit}>{submitLabel}</button>
    </div>
  )
}
