// Seed profiles shown on first load. Admin/user-added profiles are merged from localStorage.
const RAW_PROFILES = [
  {
    id: 'KM1001', name: 'Aaradhya Singh', age: 26, gender: 'Female', height: "5'4\"",
    city: 'Jaipur, Rajasthan', subCaste: 'Rajput', gotra: 'Suryavanshi',
    education: 'MBA, Symbiosis Pune', profession: 'HR Manager, Infosys', income: '₹12 LPA',
    family: 'Father — Retd. Army Officer, Mother — Homemaker, 1 younger brother',
    about: 'Family-oriented and career-driven. Loves classical dance, travel and reading. Looking for a partner who values tradition and ambition equally.',
    diet: 'Vegetarian', maritalStatus: 'Never Married', horoscope: 'Available on request',
    photo: 'https://randomuser.me/api/portraits/women/65.jpg', verified: true, premium: true,
  },
  {
    id: 'KM1002', name: 'Vikram Pratap Chauhan', age: 29, gender: 'Male', height: "5'11\"",
    city: 'Hyderabad, Telangana', subCaste: 'Chauhan Rajput', gotra: 'Agnivanshi',
    education: 'B.Tech, IIT Kharagpur', profession: 'Senior Software Engineer, Microsoft', income: '₹38 LPA',
    family: 'Father — Businessman, Mother — Teacher, 1 elder sister (married)',
    about: 'Calm, disciplined and grounded. Passionate about fitness, horse riding and technology. Seeking an educated, understanding life partner.',
    diet: 'Non-Vegetarian', maritalStatus: 'Never Married', horoscope: 'Manglik — No',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg', verified: true, premium: true,
  },
  {
    id: 'KM1003', name: 'Ishita Rathore', age: 24, gender: 'Female', height: "5'5\"",
    city: 'Indore, Madhya Pradesh', subCaste: 'Rathore', gotra: 'Suryavanshi',
    education: 'MBBS, AIIMS Bhopal', profession: 'Resident Doctor', income: '₹14 LPA',
    family: 'Father — Doctor, Mother — Professor, no siblings',
    about: 'Compassionate doctor with a love for painting and Hindustani music. Wants a partner who respects her profession.',
    diet: 'Vegetarian', maritalStatus: 'Never Married', horoscope: 'Available on request',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg', verified: true, premium: false,
  },
  {
    id: 'KM1004', name: 'Aditya Singh Tomar', age: 31, gender: 'Male', height: "6'0\"",
    city: 'Gwalior, Madhya Pradesh', subCaste: 'Tomar', gotra: 'Chandravanshi',
    education: 'CA, ICAI', profession: 'Chartered Accountant — Own Practice', income: '₹25 LPA',
    family: 'Joint family, father runs agro business, 2 brothers',
    about: 'Traditional at heart, modern in outlook. Enjoys cricket, long drives and family gatherings.',
    diet: 'Vegetarian', maritalStatus: 'Never Married', horoscope: 'Manglik — Anshik',
    photo: 'https://randomuser.me/api/portraits/men/76.jpg', verified: true, premium: false,
  },
  {
    id: 'KM1005', name: 'Kavya Solanki', age: 27, gender: 'Female', height: "5'3\"",
    city: 'Ahmedabad, Gujarat', subCaste: 'Solanki', gotra: 'Agnivanshi',
    education: 'M.Des, NID Ahmedabad', profession: 'UX Designer, Zoho', income: '₹16 LPA',
    family: 'Father — Bank Manager, Mother — Boutique owner, 1 elder brother',
    about: 'Creative soul who finds joy in design, photography and street food trails. Looking for a best friend in a husband.',
    diet: 'Eggetarian', maritalStatus: 'Never Married', horoscope: 'Available on request',
    photo: 'https://randomuser.me/api/portraits/women/68.jpg', verified: true, premium: true,
  },
  {
    id: 'KM1006', name: 'Rudra Pratap Sisodia', age: 28, gender: 'Male', height: "5'10\"",
    city: 'Udaipur, Rajasthan', subCaste: 'Sisodia', gotra: 'Suryavanshi',
    education: 'MBA, IIM Indore', profession: 'Product Manager, Flipkart', income: '₹32 LPA',
    family: 'Heritage hotel business family in Udaipur, 1 sister',
    about: 'Proud of my roots, excited about the future. Trekking, history books and good coffee keep me going.',
    diet: 'Non-Vegetarian', maritalStatus: 'Never Married', horoscope: 'Manglik — No',
    photo: 'https://randomuser.me/api/portraits/men/45.jpg', verified: true, premium: true,
  },
  {
    id: 'KM1007', name: 'Meera Parmar', age: 25, gender: 'Female', height: "5'6\"",
    city: 'Vadodara, Gujarat', subCaste: 'Parmar', gotra: 'Agnivanshi',
    education: 'M.Sc Biotechnology', profession: 'Research Associate, Zydus', income: '₹8 LPA',
    family: 'Father — Govt. officer, Mother — Homemaker, 1 younger sister',
    about: 'Simple, soft-spoken and sincere. Loves cooking, gardening and devotional music.',
    diet: 'Vegetarian', maritalStatus: 'Never Married', horoscope: 'Available on request',
    photo: 'https://randomuser.me/api/portraits/women/26.jpg', verified: false, premium: false,
  },
  {
    id: 'KM1008', name: 'Yashwant Singh Bhati', age: 33, gender: 'Male', height: "5'9\"",
    city: 'Jodhpur, Rajasthan', subCaste: 'Bhati', gotra: 'Chandravanshi',
    education: 'B.E. Mechanical', profession: 'Project Lead, L&T Defence', income: '₹22 LPA',
    family: 'Defence services family, father Retd. Colonel',
    about: 'Disciplined, straightforward and loyal. Marathon runner and amateur astronomer.',
    diet: 'Non-Vegetarian', maritalStatus: 'Never Married', horoscope: 'Manglik — No',
    photo: 'https://randomuser.me/api/portraits/men/68.jpg', verified: true, premium: false,
  },
  {
    id: 'KM1009', name: 'Ananya Jadeja', age: 26, gender: 'Female', height: "5'4\"",
    city: 'Rajkot, Gujarat', subCaste: 'Jadeja', gotra: 'Chandravanshi',
    education: 'LLB, GNLU Gandhinagar', profession: 'Corporate Lawyer, Khaitan & Co', income: '₹18 LPA',
    family: 'Father — Advocate, Mother — School Principal, 1 brother',
    about: 'Sharp mind, warm heart. Courtroom by day, kathak by evening. Seeking an equal partnership.',
    diet: 'Vegetarian', maritalStatus: 'Never Married', horoscope: 'Available on request',
    photo: 'https://randomuser.me/api/portraits/women/12.jpg', verified: true, premium: true,
  },
  {
    id: 'KM1010', name: 'Arjun Deo Parihar', age: 30, gender: 'Male', height: "5'8\"",
    city: 'Pune, Maharashtra', subCaste: 'Parihar', gotra: 'Agnivanshi',
    education: 'M.Tech, COEP', profession: 'Data Scientist, TCS Research', income: '₹20 LPA',
    family: 'Father — Professor, Mother — Homemaker, 1 sister (married)',
    about: 'Quiet thinker, loud laugher. Chess, cooking experiments and weekend treks define my off-hours.',
    diet: 'Eggetarian', maritalStatus: 'Never Married', horoscope: 'Manglik — Anshik',
    photo: 'https://randomuser.me/api/portraits/men/22.jpg', verified: true, premium: false,
  },
  {
    id: 'KM1011', name: 'Devika Chandel', age: 28, gender: 'Female', height: "5'5\"",
    city: 'Bhopal, Madhya Pradesh', subCaste: 'Chandel', gotra: 'Chandravanshi',
    education: 'B.Arch, SPA Bhopal', profession: 'Architect — Own Studio', income: '₹15 LPA',
    family: 'Business family, father in real estate, 2 siblings',
    about: 'I design spaces and dream big. Yoga, sketching and old Bollywood music are my therapy.',
    diet: 'Vegetarian', maritalStatus: 'Never Married', horoscope: 'Available on request',
    photo: 'https://randomuser.me/api/portraits/women/57.jpg', verified: true, premium: false,
  },
  {
    id: 'KM1012', name: 'Karan Vikram Shekhawat', age: 27, gender: 'Male', height: "6'1\"",
    city: 'Hyderabad, Telangana', subCaste: 'Shekhawat', gotra: 'Suryavanshi',
    education: 'B.Tech, BITS Pilani', profession: 'Founder — AgriTech Startup', income: '₹30 LPA',
    family: 'Father — IAS officer, Mother — Doctor, 1 younger brother',
    about: 'Entrepreneur building for Bharat. Early riser, gym regular, and a sucker for home-cooked dal baati.',
    diet: 'Non-Vegetarian', maritalStatus: 'Never Married', horoscope: 'Manglik — No',
    photo: 'https://randomuser.me/api/portraits/men/91.jpg', verified: true, premium: true,
  },
]

// ---- Reference data for forms & filters ----
export const CITIES = [
  { name: 'Hyderabad, Telangana', lat: 17.385, lng: 78.4867 },
  { name: 'Warangal, Telangana', lat: 17.9689, lng: 79.5941 },
  { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Udaipur, Rajasthan', lat: 24.5854, lng: 73.7125 },
  { name: 'Jodhpur, Rajasthan', lat: 26.2389, lng: 73.0243 },
  { name: 'Kota, Rajasthan', lat: 25.2138, lng: 75.8648 },
  { name: 'Indore, Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { name: 'Gwalior, Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
  { name: 'Bhopal, Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { name: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Vadodara, Gujarat', lat: 22.3072, lng: 73.1812 },
  { name: 'Rajkot, Gujarat', lat: 22.3039, lng: 70.8022 },
  { name: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311 },
  { name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Mumbai, Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'Nagpur, Maharashtra', lat: 21.1458, lng: 79.0882 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.209 },
  { name: 'Lucknow, Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Visakhapatnam, Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
]

export const cityCoords = (cityName) => {
  if (!cityName) return null
  const exact = CITIES.find(c => c.name === cityName)
  if (exact) return exact
  const first = cityName.split(',')[0].trim().toLowerCase()
  return CITIES.find(c => c.name.toLowerCase().startsWith(first)) || null
}

// Haversine distance in km
export const distanceKm = (a, b) => {
  if (!a || !b) return null
  const R = 6371, rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)))
}

export const INTERESTS = [
  'Travel', 'Music', 'Fitness', 'Reading', 'Cooking', 'Dance', 'Cricket',
  'Trekking', 'Photography', 'Movies', 'Yoga', 'Gardening', 'Art & Sketching',
  'Spirituality', 'Horse Riding', 'Chess',
]

export const PROFESSION_CATEGORIES = [
  'IT / Software', 'Doctor / Medical', 'Engineer', 'CA / Finance', 'Lawyer',
  'Business / Entrepreneur', 'Government / Civil Services', 'Defence',
  'Architect / Designer', 'Teacher / Professor', 'Research / Science', 'Other',
]

export const RELATIONS = ['Myself', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative', 'Friend']

export const postedByLabel = (relation) => {
  if (!relation || relation === 'Myself') return 'Posted by Self'
  if (relation === 'Son' || relation === 'Daughter') return 'Posted by Parent'
  if (relation === 'Brother' || relation === 'Sister') return 'Posted by Sibling'
  return `Posted by ${relation}`
}

// Extra fields for the seed profiles
const EXTRA = {
  KM1001: { professionCategory: 'IT / Software', interests: ['Dance', 'Travel', 'Reading'], relation: 'Daughter' },
  KM1002: { professionCategory: 'IT / Software', interests: ['Fitness', 'Horse Riding', 'Cricket'], relation: 'Myself' },
  KM1003: { professionCategory: 'Doctor / Medical', interests: ['Art & Sketching', 'Music', 'Yoga'], relation: 'Daughter' },
  KM1004: { professionCategory: 'CA / Finance', interests: ['Cricket', 'Travel', 'Movies'], relation: 'Myself' },
  KM1005: { professionCategory: 'Architect / Designer', interests: ['Photography', 'Travel', 'Cooking'], relation: 'Sister' },
  KM1006: { professionCategory: 'IT / Software', interests: ['Trekking', 'Reading', 'Travel'], relation: 'Myself' },
  KM1007: { professionCategory: 'Research / Science', interests: ['Cooking', 'Gardening', 'Spirituality'], relation: 'Daughter' },
  KM1008: { professionCategory: 'Defence', interests: ['Fitness', 'Trekking', 'Chess'], relation: 'Myself' },
  KM1009: { professionCategory: 'Lawyer', interests: ['Dance', 'Reading', 'Music'], relation: 'Daughter' },
  KM1010: { professionCategory: 'IT / Software', interests: ['Chess', 'Cooking', 'Trekking'], relation: 'Myself' },
  KM1011: { professionCategory: 'Architect / Designer', interests: ['Yoga', 'Art & Sketching', 'Music'], relation: 'Sister' },
  KM1012: { professionCategory: 'Business / Entrepreneur', interests: ['Fitness', 'Travel', 'Cooking'], relation: 'Myself' },
}

export const SEED_PROFILES = RAW_PROFILES.map(p => ({
  ...p,
  ...EXTRA[p.id],
  coords: cityCoords(p.city),
  createdBy: 'SEED',
}))

export const PLANS = [
  {
    id: 'silver', name: 'Silver', price: 999, period: '3 months', color: '#9aa3ad',
    features: ['View full profiles & photos', 'Send interests', 'Chat with matches', '20 contact views'],
    chat: true, call: false,
  },
  {
    id: 'gold', name: 'Gold', price: 2499, period: '6 months', color: '#c9962e', popular: true,
    features: ['Everything in Silver', 'Voice & video calls', 'Unlimited contact views', 'Profile highlighted in search'],
    chat: true, call: true,
  },
  {
    id: 'platinum', name: 'Platinum', price: 4999, period: '12 months', color: '#7b1e26',
    features: ['Everything in Gold', 'Dedicated relationship manager', 'Horoscope matching report', 'Top placement in matches'],
    chat: true, call: true,
  },
]
