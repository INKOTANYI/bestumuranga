import { useEffect, useState } from 'react'
import { register, checkEmailAvailable, checkPhoneAvailable, me, getProvinces, getDistricts, getSectors, getCities, getTerritories } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function BrokerRegister() {
  const nav = useNavigate()
  const [first_name, setFirst] = useState('')
  const [last_name, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState(null)
  const [touched, setTouched] = useState({})
  const [emailAvailable, setEmailAvailable] = useState(null) // null=unknown, true/false
  const [emailChecking, setEmailChecking] = useState(false)
  const [phoneAvailable, setPhoneAvailable] = useState(null)
  const [phoneChecking, setPhoneChecking] = useState(false)
  const [terms, setTerms] = useState(false)

  // Country + location state
  const [country, setCountry] = useState('RW') // RW or DRC
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])   // Rwanda districts
  const [sectors, setSectors] = useState([])       // Rwanda sectors
  const [cities, setCities] = useState([])         // DRC cities
  const [territories, setTerritories] = useState([]) // DRC territories
  const [province_id, setProvinceId] = useState('')
  const [district_id, setDistrictId] = useState('')
  const [sector_id, setSectorId] = useState('')
  const [city_id, setCityId] = useState('')
  const [territory_id, setTerritoryId] = useState('')

  function strength(pw) {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[a-z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score // 0..5
  }

  function validateEmail(v){
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v)
  }
  function validatePhone(v, c){
    if (c === 'DRC') {
      return /^\+243[0-9]{9}$/.test(v)
    }
    return /^(078|072|073)[0-9]{7}$/.test(v)
  }
  function validatePassword(v){
    return strength(v) >= 4
  }

  const fieldErrors = {
    first_name: !first_name ? 'First name is required' : '',
    last_name: !last_name ? 'Last name is required' : '',
    email: !email ? 'Email is required' : (!validateEmail(email) ? 'Enter a valid email' : (emailAvailable === false ? 'Email already taken' : '')),
    phone: !phone ? 'Phone is required' : (!validatePhone(phone, country) ? (country === 'DRC' ? 'Use format +243XXXXXXXXX' : 'Use format 078xxxxxxx / 072xxxxxxx / 073xxxxxxx') : (phoneAvailable === false ? 'Phone already taken' : '')),
    password: !password ? 'Password is required' : (!validatePassword(password) ? 'Password too weak' : ''),
    password2: password2 !== password ? 'Passwords do not match' : '',
    province_id: !province_id ? 'Select province' : '',
    // For Rwanda we require district/sector; for DRC we require city/territory
    district_id: country === 'RW' && !district_id ? 'Select district' : '',
    sector_id: country === 'RW' && !sector_id ? 'Select sector' : '',
    city_id: country === 'DRC' && !city_id ? 'Select city' : '',
    territory_id: country === 'DRC' && !territory_id ? 'Select territory' : '',
  }
  const isValid = Object.values(fieldErrors).every(v => v === '')

  // Debounced email availability check
  useEffect(() => {
    setEmailAvailable(null)
    if (!validateEmail(email)) return
    const t = setTimeout(async () => {
      try {
        setEmailChecking(true)
        const res = await checkEmailAvailable(email)
        setEmailAvailable(!!res.available)
      } catch {
        setEmailAvailable(null)
      } finally {
        setEmailChecking(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [email])

  // Debounced phone availability check
  useEffect(() => {
    setPhoneAvailable(null)
    if (!phone || !validatePhone(phone, country)) return
    const t = setTimeout(async () => {
      try {
        setPhoneChecking(true)
        const res = await checkPhoneAvailable(phone)
        setPhoneAvailable(!!res.available)
      } catch {
        setPhoneAvailable(null)
      } finally {
        setPhoneChecking(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [phone, country])

  // Load provinces when country changes
  useEffect(() => {
    (async () => {
      try {
        const res = await getProvinces(country)
        setProvinces(res.data || [])
      } catch {
        setProvinces([])
      }
      // reset deeper levels when country changes
      setProvinceId('')
      setDistrictId('')
      setSectorId('')
      setCityId('')
      setTerritoryId('')
      setDistricts([])
      setSectors([])
      setCities([])
      setTerritories([])
      setPhone('')
      setPhoneAvailable(null)
      setTouched(t => ({ ...t, phone: false }))
    })()
  }, [country])

  // When province changes, load either Rwanda districts or DRC cities/territories
  useEffect(() => {
    if (!province_id) {
      setDistricts([]); setDistrictId(''); setSectors([]); setSectorId('')
      setCities([]); setCityId(''); setTerritories([]); setTerritoryId('')
      return
    }
    (async () => {
      try {
        if (country === 'RW') {
          const res = await getDistricts(province_id)
          setDistricts(res.data || [])
          setDistrictId('')
          setSectors([])
          setSectorId('')
          setCities([])
          setTerritories([])
        } else {
          const [cRes, tRes] = await Promise.all([
            getCities(province_id),
            getTerritories(province_id),
          ])
          setCities(cRes.data || [])
          setTerritories(tRes.data || [])
          setCityId('')
          setTerritoryId('')
          setDistricts([])
          setSectors([])
        }
      } catch {}
    })()
  }, [province_id, country])

  // When district changes, load sectors and reset sector
  useEffect(() => {
    if (!district_id) { setSectors([]); setSectorId(''); return }
    (async () => {
      try {
        const res = await getSectors(district_id)
        setSectors(res.data || [])
        setSectorId('')
      } catch {}
    })()
  }, [district_id])

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (!isValid || !terms) {
        setTouched({first_name:true,last_name:true,email:true,phone:true,password:true,password2:true,province_id:true,district_id:true,sector_id:true});
        setLoading(false);
        return
      }
      const payload = { first_name, last_name, email, phone, password, password_confirmation: password2, role: 'broker', country, province_id, district_id, sector_id, city_id, territory_id }
      await register(payload)
      const fresh = await me()
      const role = fresh?.user?.role
      if (role === 'admin') nav('/admin')
      else if (role === 'broker') nav('/broker')
      else nav('/')
    } catch (e) {
      const res = e?.response
      if (res?.status === 422 && res?.data?.errors) {
        setErrors(res.data.errors)
        setError('Validation failed')
      } else if (res?.data?.message) {
        setError(res.data.message)
        setErrors(null)
      } else {
        setError('Registration failed. Check inputs or try again.')
        setErrors(null)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-tr from-purple-300/60 via-white to-purple-200/60">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden border">
        {/* Left welcome panel */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="relative h-full w-full p-8 bg-black/40 text-white flex flex-col justify-end">
            <h2 className="text-3xl font-bold drop-shadow">Welcome</h2>
            <p className="mt-3 text-sm text-gray-100 max-w-sm">Create your account. It’s free and only takes a minute. Manage listings and more after you sign in.</p>
            <button type="button" onClick={()=>nav('/auth-test')} className="mt-6 inline-flex items-center gap-2 text-sm text-white/90 hover:text-white">Already have an account? Login</button>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8">
          <h3 className="text-2xl font-semibold">Register</h3>
          <p className="text-gray-600 text-sm mt-1 mb-6">Create your account. It’s free and only takes a minute.</p>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.first_name && fieldErrors.first_name ? 'border-rose-500' : 'border-gray-300'}`} placeholder="First Name" value={first_name} onChange={e=>{ setFirst(e.target.value); setTouched(t=>({...t,first_name:true})) }} onBlur={()=>setTouched(t=>({...t,first_name:true}))} required />
                {touched.first_name && fieldErrors.first_name && <div className="text-rose-600 text-xs mt-1">{fieldErrors.first_name}</div>}
              </div>
              <div>
                <input className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.last_name && fieldErrors.last_name ? 'border-rose-500' : 'border-gray-300'}`} placeholder="Last Name" value={last_name} onChange={e=>{ setLast(e.target.value); setTouched(t=>({...t,last_name:true})) }} onBlur={()=>setTouched(t=>({...t,last_name:true}))} required />
                {touched.last_name && fieldErrors.last_name && <div className="text-rose-600 text-xs mt-1">{fieldErrors.last_name}</div>}
              </div>
            </div>

            <div>
              <input className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.email && fieldErrors.email ? 'border-rose-500' : 'border-gray-300'}`} placeholder="Email" type="email" value={email} onChange={e=>{ setEmail(e.target.value); setTouched(t=>({...t,email:true})) }} onBlur={()=>setTouched(t=>({...t,email:true}))} required />
              {emailChecking && <div className="text-gray-500 text-xs mt-1">Checking availability...</div>}
              {touched.email && fieldErrors.email && <div className="text-rose-600 text-xs mt-1">{fieldErrors.email}</div>}
              
            </div>

            {/* Broker Address Location */}
            <div className="mt-2">
              <div className="text-sm font-medium text-gray-800 mb-2">Broker Address Location</div>
            </div>

            {/* Country selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <select className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" value={country} onChange={e=>{ setCountry(e.target.value); }}>
                  <option value="RW">
                    🇷🇼 Rwanda
                  </option>
                  <option value="DRC">
                    🇨🇩 DRC
                  </option>
                </select>
                <div className="text-xs text-gray-500 mt-1">Select broker operating country</div>
              </div>
            </div>

            {/* Location selects (switch by country) */}
            {country === 'RW' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div>
                  <select className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.province_id && fieldErrors.province_id ? 'border-rose-500' : 'border-gray-300'}`} value={province_id} onChange={e=>{ setProvinceId(e.target.value); setTouched(t=>({...t,province_id:true})) }} onBlur={()=>setTouched(t=>({...t,province_id:true}))} required>
                    <option value="">Select Province</option>
                    {provinces.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                  {touched.province_id && fieldErrors.province_id && <div className="text-rose-600 text-xs mt-1">{fieldErrors.province_id}</div>}
                </div>
                <div>
                  <select className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.district_id && fieldErrors.district_id ? 'border-rose-500' : 'border-gray-300'}`} value={district_id} onChange={e=>{ setDistrictId(e.target.value); setTouched(t=>({...t,district_id:true})) }} onBlur={()=>setTouched(t=>({...t,district_id:true}))} required disabled={!province_id}>
                    <option value="">Select District</option>
                    {districts.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                  {touched.district_id && fieldErrors.district_id && <div className="text-rose-600 text-xs mt-1">{fieldErrors.district_id}</div>}
                </div>
                <div>
                  <select className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.sector_id && fieldErrors.sector_id ? 'border-rose-500' : 'border-gray-300'}`} value={sector_id} onChange={e=>{ setSectorId(e.target.value); setTouched(t=>({...t,sector_id:true})) }} onBlur={()=>setTouched(t=>({...t,sector_id:true}))} required disabled={!district_id}>
                    <option value="">Select Sector</option>
                    {sectors.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </select>
                  {touched.sector_id && fieldErrors.sector_id && <div className="text-rose-600 text-xs mt-1">{fieldErrors.sector_id}</div>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div>
                  <select className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.province_id && fieldErrors.province_id ? 'border-rose-500' : 'border-gray-300'}`} value={province_id} onChange={e=>{ setProvinceId(e.target.value); setTouched(t=>({...t,province_id:true})) }} onBlur={()=>setTouched(t=>({...t,province_id:true}))} required>
                    <option value="">Select Province</option>
                    {provinces.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                  {touched.province_id && fieldErrors.province_id && <div className="text-rose-600 text-xs mt-1">{fieldErrors.province_id}</div>}
                </div>
                <div>
                  <select className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.city_id && fieldErrors.city_id ? 'border-rose-500' : 'border-gray-300'}`} value={city_id} onChange={e=>{ setCityId(e.target.value); setTouched(t=>({...t,city_id:true})) }} onBlur={()=>setTouched(t=>({...t,city_id:true}))} required disabled={!province_id}>
                    <option value="">Select City</option>
                    {cities.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                  {touched.city_id && fieldErrors.city_id && <div className="text-rose-600 text-xs mt-1">{fieldErrors.city_id}</div>}
                </div>
                <div>
                  <select className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.territory_id && fieldErrors.territory_id ? 'border-rose-500' : 'border-gray-300'}`} value={territory_id} onChange={e=>{ setTerritoryId(e.target.value); setTouched(t=>({...t,territory_id:true})) }} onBlur={()=>setTouched(t=>({...t,territory_id:true}))} required disabled={!province_id}>
                    <option value="">Select Territory</option>
                    {territories.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                  {touched.territory_id && fieldErrors.territory_id && <div className="text-rose-600 text-xs mt-1">{fieldErrors.territory_id}</div>}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-stretch">
                <div className="flex items-center gap-1 px-3 border border-r-0 rounded-l-lg bg-gray-50 text-sm">
                  <span className="text-lg">
                    {country === 'DRC' ? '🇨🇩' : '🇷🇼'}
                  </span>
                  <span className="text-gray-700">
                    {country === 'DRC' ? '+243' : '+250'}
                  </span>
                </div>
                <input
                  className={`border rounded-r-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.phone && fieldErrors.phone ? 'border-rose-500' : 'border-gray-300'}`}
                  placeholder={country === 'DRC' ? 'Phone (e.g. +2439XXXXXXXX)' : 'Phone (e.g. 0781234567)'}
                  value={phone}
                  onChange={e=>{ setPhone(e.target.value); setTouched(t=>({...t,phone:true})) }}
                  onBlur={()=>setTouched(t=>({...t,phone:true}))}
                  required
                />
              </div>
              {phoneChecking && <div className="text-gray-500 text-xs mt-1">Checking availability...</div>}
              {touched.phone && fieldErrors.phone && <div className="text-rose-600 text-xs mt-1">{fieldErrors.phone}</div>}
            </div>

            <div>
              <input className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.password && fieldErrors.password ? 'border-rose-500' : 'border-gray-300'}`} placeholder="Password" type="password" value={password} onChange={e=>{ setPassword(e.target.value); setTouched(t=>({...t,password:true})) }} onBlur={()=>setTouched(t=>({...t,password:true}))} required />
              <div className="h-2 bg-gray-200 rounded overflow-hidden mt-2">
                <div className={`h-full ${strength(password)>=4?'bg-emerald-500':strength(password)>=3?'bg-yellow-500':'bg-rose-500'}`} style={{width: `${Math.min(strength(password)*20, 100)}%`}}></div>
              </div>
              {touched.password && fieldErrors.password && <div className="text-rose-600 text-xs mt-1">{fieldErrors.password}</div>}
            </div>

            <div>
              <input className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.password2 && fieldErrors.password2 ? 'border-rose-500' : 'border-gray-300'}`} placeholder="Confirm Password" type="password" value={password2} onChange={e=>{ setPassword2(e.target.value); setTouched(t=>({...t,password2:true})) }} onBlur={()=>setTouched(t=>({...t,password2:true}))} required />
              {touched.password2 && fieldErrors.password2 && <div className="text-rose-600 text-xs mt-1">{fieldErrors.password2}</div>}
            </div>

            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" checked={terms} onChange={e=>setTerms(e.target.checked)} />
              <span>I accept the <a href="#" className="text-indigo-600 hover:underline">Terms of Use</a> & <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a></span>
            </label>

            <button disabled={loading || !isValid || !terms} className="rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Submitting...' : 'Register Now'}</button>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {errors && (
              <ul className="text-red-600 text-sm list-disc pl-5">
                {Object.entries(errors).map(([k,arr]) => (
                  <li key={k}>{k}: {Array.isArray(arr)? arr.join(', '): String(arr)}</li>
                ))}
              </ul>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}