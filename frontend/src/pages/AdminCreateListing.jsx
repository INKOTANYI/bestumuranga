import { useEffect, useMemo, useState } from 'react'
import { adminCreateListing, generateListingDescription, getCategories, getProvinces, getDistricts, getSectors } from '../lib/api'
import { Image as ImageIcon, MapPin, BedDouble, Bath, Trees, Car, Home, Warehouse } from 'lucide-react'

export default function AdminCreateListing() {
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [provinces, setProvinces] = useState([])
  const [districts,   setDistricts] = useState([])
  const [sectors,     setSectors] = useState([])
  const [provinceId,  setProvinceId] = useState('')
  const [districtId,  setDistrictId] = useState('')
  const [form, setForm] = useState({
    category_id: '',
    transaction_type: 'sell',
    title: '',
    price: '',
    province: '',
    district: '',
    sector: '',
    key_features: '',
    description: '',
    tone: 'professional',
    extras: {},
    images: [],
    status: 'published',
  })
  const [previews, setPreviews] = useState([])
  const [nbhdPreviews, setNbhdPreviews] = useState([])
  const [locLoading, setLocLoading] = useState({ provinces: false, districts: false, sectors: false })
  const [locWarning, setLocWarning] = useState('')
  const [staticLoc, setStaticLoc] = useState(null)
  const [errors, setErrors] = useState({})
  // Validation errors state
  const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'info' })

  useEffect(() => {
    (async () => {
      const cats = await getCategories()
      const list = Array.isArray(cats?.data) ? cats.data : (Array.isArray(cats) ? cats : [])
      setCategories(list.map(c => ({ id: c.id, name: c.name })))
      // Load provinces from API
      try {
        setLocLoading(l=>({ ...l, provinces: true }))
        const pv = await getProvinces()
        const list = pv?.data || []
        setProvinces(list)
        if (!list.length) {
          // fallback to static file
          const res = await fetch('/rwanda-locations.json').then(r=> r.ok ? r.json() : null).catch(()=>null)
          if (res && Array.isArray(res?.provinces)) {
            setStaticLoc(res)
            setProvinces(res.provinces.map(p=> ({ id: p.id || p.name, name: p.name })))
            setLocWarning('Live locations empty. Using built-in Rwanda dataset.')
          }

  function validate() {
    const v = {}
    if (!form.title) v.title = 'Title is required'
    if (!form.category_id) v.category_id = 'Category is required'
    if (!form.transaction_type) v.transaction_type = 'Transaction type is required'
    if (!form.price) v.price = 'Price/Rent is required'
    if (!provinceId) v.province = 'Province is required'
    if (!districtId) v.district = 'District is required'
    if (!form.sector) v.sector = 'Sector is required'
    if (!form.images || form.images.length === 0) v.images = 'Please add at least one image'
    const key = catKey()
    if (key === 'house' || key === 'apartment') {
      if (!form.extras?.bedrooms) v.bedrooms = 'Bedrooms required'
      if (!form.extras?.bathrooms) v.bathrooms = 'Bathrooms required'
      if (!form.extras?.area_sqm) v.area_sqm = 'Area is required'
    }
    // If renting, require rent period. For apartments: daily/weekly/monthly; for houses: monthly/yearly
    if ((form.transaction_type||'').toLowerCase() === 'rent') {
      if (key === 'apartment' && !form.extras?.rent_period) v.rent_period = 'Select rent period (daily/weekly/monthly)'
      if (key === 'house' && !form.extras?.rent_period) v.rent_period = 'Select rent period (monthly/yearly)'
    }
    if (key === 'car') {
      if (!form.extras?.transmission) v.transmission = 'Transmission required'
      if (!form.extras?.year) v.year = 'Year required'
    }
    return v
  }
        }
      } catch {
        const res = await fetch('/rwanda-locations.json').then(r=> r.ok ? r.json() : null).catch(()=>null)
        if (res && Array.isArray(res?.provinces)) {
          setStaticLoc(res)
          setProvinces(res.provinces.map(p=> ({ id: p.id || p.name, name: p.name })))
          setLocWarning('Location API not available. Using built-in Rwanda dataset.')
        }
      } finally { setLocLoading(l=>({ ...l, provinces: false })) }
    })()
  }, [])

  // When province changes, load districts
  async function onProvinceChange(name, id) {
    setField('province', name)
    setProvinceId(id)
    setField('district', '')
    setField('sector', '')
    setDistrictId('')
    setSectors([])
    try {
      setLocLoading(l=>({ ...l, districts: true }))
      let arr = []
      if (staticLoc) {
        const prov = (staticLoc.provinces || []).find(p=> String(p.id||p.name) === String(id) || p.name === name)
        arr = (prov?.districts || []).map(d=> ({ id: d.id || d.name, name: d.name }))
      } else {
        const ds = await getDistricts(id)
        arr = ds?.data || []
      }
      setDistricts(arr)
    } catch { setDistricts([]) } finally { setLocLoading(l=>({ ...l, districts: false })) }
  }
  // When district changes, load sectors
  async function onDistrictChange(name, id) {
    setField('district', name)
    setDistrictId(id)
    setField('sector', '')
    try {
      setLocLoading(l=>({ ...l, sectors: true }))
      let arr = []
      if (staticLoc) {
        const prov = (staticLoc.provinces || []).find(p=> p.name === form.province || String(p.id||p.name) === String(provinceId))
        const dist = (prov?.districts || []).find(d=> String(d.id||d.name) === String(id) || d.name === name)
        arr = (dist?.sectors || []).map(s=> ({ id: s.id || s.name, name: s.name }))
      } else {
        const ss = await getSectors(id)
        arr = ss?.data || []
      }
      setSectors(arr)
    } catch { setSectors([]) } finally { setLocLoading(l=>({ ...l, sectors: false })) }
  }

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function setExtra(k, v) { setForm(f => ({ ...f, extras: { ...f.extras, [k]: v } })) }

  async function doAI() {
    setAiLoading(true)
    try {
      const catName = categories.find(c=> String(c.id) === String(form.category_id))?.name || 'general'
      const key = catKey()
      let extras = {}
      if (key === 'car') {
        extras = {
          colour: form.extras?.colour || form.extras?.color || '',
          mileage: form.extras?.mileage || '',
          transmission: form.extras?.transmission || '',
          year: form.extras?.year || '',
          engine_size: form.extras?.engine_size || '',
        }
      } else if (key === 'house' || key === 'apartment') {
        extras = {
          bedrooms: form.extras?.bedrooms || '',
          bathrooms: form.extras?.bathrooms || '',
          neighbourhood: form.extras?.neighbourhood || '',
          area: form.extras?.area_sqm || form.extras?.area || '',
          garden: !!form.extras?.garden,
          garage: !!form.extras?.garage,
        }
      }
      const payload = {
        category: catName,
        title: form.title || 'New Listing',
        // Sector, District, Province order for better clarity
        location: [form.sector, form.district, form.province].filter(Boolean).join(', '),
        price_info: form.price ? String(form.price) : '',
        key_features: form.key_features ? form.key_features.split(',').map(s=>s.trim()).filter(Boolean) : [],
        transaction: form.transaction_type || 'sell',
        tone: form.tone || 'professional',
        extras,
      }
      const { description } = await generateListingDescription(payload)
      setField('description', description || '')
    } catch (e) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message || e?.message || 'Unknown error'
      // eslint-disable-next-line no-console
      console.error('AI description error:', e?.response || e)
      alert(`AI description failed (${status || 'no status'}): ${msg}`)
    } finally {
      setAiLoading(false)
    }
  }

  async function submit(e) {
    // Debug: ensure we see submit trigger
    // eslint-disable-next-line no-console
    console.log('Submit clicked')
    e?.preventDefault?.()
    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      // eslint-disable-next-line no-console
      console.log('Validation errors:', v)
      // eslint-disable-next-line no-console
      console.log('Form state:', form, { provinceId, districtId, sectorsCount: sectors.length })
      const msgs = Object.values(v).slice(0, 5).join('\n')
      setModal({ open: true, title: 'Missing required fields', message: msgs.replaceAll('\n', ' • '), type: 'error' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setLoading(true)
    setModal({ open: true, title: 'Publishing…', message: 'Uploading images and saving your listing. Please wait…', type: 'progress' })
    try {
      const fd = new FormData()
      fd.append('category_id', form.category_id)
      fd.append('type', form.transaction_type)
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('price', form.price)
      fd.append('location', [form.province, form.district, form.sector].filter(Boolean).join(', '))
      fd.append('location_province', form.province)
      fd.append('location_district', form.district)
      fd.append('location_sector', form.sector)
      const attrs = { ...form.extras, province: form.province, district: form.district, sector: form.sector }
      Object.entries(attrs).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          fd.append(`attributes[${k}]`, v)
        }
      })
      for (const file of form.images) fd.append('images[]', file)
      await adminCreateListing(fd)
      setModal({ open: true, title: 'Success', message: 'Your listing has been published successfully.', type: 'success' })
      setTimeout(()=> { window.location.href = '/admin' }, 800)
    } catch (err) {
      const status = err?.response?.status
      const backendErrors = err?.response?.data?.errors
      if (status === 422 && backendErrors) {
        // Map Laravel validation errors to our local errors shape
        const mapped = {}
        Object.entries(backendErrors).forEach(([k, arr]) => { if (Array.isArray(arr) && arr[0]) mapped[k] = arr[0] })
        setErrors(mapped)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setModal({ open: true, title: 'Validation failed', message: 'Please review the highlighted fields and try again.', type: 'error' })
      } else {
        if (status === 401) {
          setModal({ open: true, title: 'Unauthorized (401)', message: 'You need to login again to publish listings. Please refresh and login, then try again.', type: 'error' })
        } else if (status === 419) {
          setModal({ open: true, title: 'Session expired (419)', message: 'Your session/CSRF token expired. Please refresh the page and try again.', type: 'error' })
        } else {
          const msg = err?.response?.data?.message || err?.message || 'Unknown error'
          setModal({ open: true, title: `Save failed${status ? ` (${status})` : ''}`, message: msg, type: 'error' })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  function catKey() {
    const name = (categories.find(c=> String(c.id) === String(form.category_id))?.name || '').toLowerCase()
    if (name.includes('apartment')) return 'apartment'
    if (name.includes('house') || name.includes('home')) return 'house'
    if (name.includes('car') || name.includes('vehicle') || name.includes('auto')) return 'car'
    if (name.includes('furniture')) return 'furniture'
    if (name.includes('plot') || name.includes('land')) return 'plot'
    return name
  }

  function CategoryExtras() {
    switch (catKey()) {
      case 'car':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Colour" value={form.extras?.colour || ''} onChange={v=> setExtra('colour', v)} />
            <Input label="Mileage" value={form.extras?.mileage || ''} onChange={v=> setExtra('mileage', v)} />
            <Select label="Transmission" value={form.extras?.transmission || ''} options={['automatic','manual']} onChange={v=> setExtra('transmission', v)} />
            <Input label="Engine Size" value={form.extras?.engine_size || ''} onChange={v=> setExtra('engine_size', v)} />
            <Input label="Year" value={form.extras?.year || ''} onChange={v=> setExtra('year', v)} />
            <Select label="Fuel Type" value={form.extras?.fuel_type || ''} options={['petrol','diesel','hybrid','electric']} onChange={v=> setExtra('fuel_type', v)} />
          </div>
        )
      case 'house':
      case 'apartment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Bedrooms" value={form.extras?.bedrooms || ''} onChange={v=> setExtra('bedrooms', v)} />
            <Input label="Bathrooms" value={form.extras?.bathrooms || ''} onChange={v=> setExtra('bathrooms', v)} />
            <Toggle label="Garden" checked={!!form.extras?.garden} onChange={v=> setExtra('garden', v)} />
            <Toggle label="Garage" checked={!!form.extras?.garage} onChange={v=> setExtra('garage', v)} />
            <div className="space-y-2">
              <Input label="Neighbourhood" value={form.extras?.neighbourhood || ''} onChange={v=> setExtra('neighbourhood', v)} />
              <label className="text-xs text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" />
                <span>Neighbourhood Photos</span>
                <input type="file" multiple className="ml-2" onChange={e=> {
                  const files = Array.from(e.target.files||[]);
                  setField('images', [...form.images, ...files]);
                  setNbhdPreviews(files.map(f=> URL.createObjectURL(f)));
                }} />
              </label>
              {nbhdPreviews.length>0 && (
                <div className="grid grid-cols-3 gap-1">
                  {nbhdPreviews.map((src, i)=> (
                    <div key={`nbhd-mini-${i}`} className="aspect-square rounded overflow-hidden border border-white/10">
                      <img src={src} alt="neighbourhood" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Input label="Area (sqm)" value={form.extras?.area_sqm || ''} onChange={v=> setExtra('area_sqm', v)} />
          </div>
        )
      case 'furniture':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Material" onChange={v=> setExtra('material', v)} />
            <Input label="Condition" onChange={v=> setExtra('condition', v)} />
            <Input label="Seats/Size" onChange={v=> setExtra('seats_or_size', v)} />
          </div>
        )
      case 'plot':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Size Value" onChange={v=> setExtra('size_value', v)} />
            <Select label="Size Unit" options={['acre','are']} onChange={v=> setExtra('size_unit', v)} />
            <Select label="Zoning" options={['event','commercial','residential']} onChange={v=> setExtra('zoning', v)} />
            <Toggle label="Road Access" onChange={v=> setExtra('road_access', v)} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-925 to-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <h2 className="text-2xl font-semibold mb-4">Create Listing</h2>
        {loading && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="rounded-xl bg-gray-900/90 border border-white/10 p-4 text-sm text-gray-200">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></span>
                <span>Publishing… please wait</span>
              </div>
            </div>
          </div>
        )}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 p-4">
            <div className="font-medium mb-2">Please fix the following before publishing:</div>
            <ul className="list-disc list-inside text-sm space-y-1">
              {Object.values(errors).slice(0,6).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
              {Object.values(errors).length > 6 && (
                <li>and more…</li>
              )}
            </ul>
          </div>
        )}
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 pb-2">

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur h-full min-h-[280px] flex flex-col md:col-start-1 md:row-start-1">
            <h3 className="text-lg font-medium mb-4">Step 1: Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow">
              <Input label="Title" value={form.title} onChange={v=> setField('title', v)} error={errors.title} required />
              <Select label="Category" value={form.category_id} options={categories.map(c=>({ label: c.name, value: c.id }))} onChange={()=> setForm(f=> ({ ...f, extras: {} }))} onChangeValue={(val)=> setField('category_id', val)} required error={errors.category_id} />
              <Select label="Transaction Type" value={form.transaction_type} options={['sell','rent']} onChangeValue={(val)=> setField('transaction_type', val)} onChange={(label)=> setField('transaction_type', label)} required error={errors.transaction_type} />
              <Input label="Price / Rent" value={form.price} onChange={v=> setField('price', v)} error={errors.price} required />
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur h-full min-h-[280px] flex flex-col md:col-start-2 md:row-start-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Step 5: AI Description</h3>
              <div className="flex items-center gap-3">
                <Select label="Tone" value={form.tone} options={['professional','friendly','luxury']} onChange={v=> setField('tone', v)} />
                <button type="button" className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]" onClick={doAI} disabled={aiLoading}>{aiLoading ? 'Generating…' : 'Generate'}</button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gray-800/60 p-4">
              <div className="text-xs text-gray-400 mb-2">AI will draft; you can edit.</div>
              <textarea className="w-full min-h-[260px] rounded-xl bg-gray-900/40 text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder={aiLoading ? 'AI is writing…' : 'Write or generate a compelling description'} value={form.description} onChange={e=> setField('description', e.target.value)} />
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur h-full min-h-[280px] flex flex-col md:col-start-1 md:row-start-2">
            <h3 className="text-lg font-medium mb-4">Step 2: Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow">
              <Select label={`Province${locLoading.provinces?' (loading)':''}`} value={String(provinceId||'')} icon={<MapPin className="w-4 h-4 text-purple-300" />} options={provinces.map(p=>({label:p.name,value:String(p.id)}))} onChangeValue={(val)=>{ const p=provinces.find(x=>String(x.id)===String(val)); if(p) onProvinceChange(p.name,p.id); }} required error={errors.province} />
              <Select label={`District${locLoading.districts?' (loading)':''}`} value={String(districtId||'')} icon={<MapPin className="w-4 h-4 text-purple-300" />} options={districts.map(d=>({label:d.name,value:String(d.id)}))} onChangeValue={(val)=>{ const d=districts.find(x=>String(x.id)===String(val)); if(d) onDistrictChange(d.name,d.id); }} required error={errors.district} />
              <Select label={`Sector${locLoading.sectors?' (loading)':''}`} value={form.sector ? (sectors.find(s=>s.name===form.sector)?.id ?? '') : ''} icon={<MapPin className="w-4 h-4 text-purple-300" />} options={sectors.map(s=>({label:s.name,value:String(s.id)}))} onChange={(name)=> setField('sector', name)} onChangeValue={(val)=>{ const s=sectors.find(x=>String(x.id)===String(val)); if(s) setField('sector', s.name); }} required error={errors.sector} />
            </div>
            {locWarning && <div className="text-xs text-amber-400 mt-2">{locWarning}</div>}
            {catKey()!== 'car' && catKey()!== 'furniture' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Neighbourhood" value={form.extras?.neighbourhood || ''} onChange={v=> setExtra('neighbourhood', v)} />
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" />
                    <span>Neighbourhood Photos</span>
                    <input type="file" multiple className="ml-2" onChange={e=> {
                      const files = Array.from(e.target.files||[]);
                      setField('images', [...form.images, ...files]);
                      setNbhdPreviews(files.map(f=> URL.createObjectURL(f)));
                    }} />
                  </label>
                  {nbhdPreviews.length>0 && (
                    <div className="grid grid-cols-4 gap-1">
                      {nbhdPreviews.map((src, i)=> (
                        <div key={`nbhd-${i}`} className="aspect-square rounded overflow-hidden border border-white/10"><img src={src} alt="neighbourhood" className="w-full h-full object-cover" /></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Map picker removed as requested */}
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur h-full min-h-[280px] flex flex-col md:col-start-2 md:row-start-2">
            <h3 className="text-lg font-medium mb-4">Step 4: Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <label className="text-sm text-gray-300 flex flex-col gap-2">
                <span className="inline-flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Main Images</span>
                <input type="file" multiple onChange={e=> {
                  const files = Array.from(e.target.files||[]);
                  setField('images', files);
                  setPreviews(files.map(f=> URL.createObjectURL(f)));
                }} />
                {errors.images && <span className="text-rose-400 text-xs">{errors.images}</span>}
              </label>
            </div>
            {previews.length>0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {previews.map((src, i)=> (
                  <div key={`main-${i}`} className="aspect-square rounded-lg overflow-hidden border border-white/10"><img src={src} alt="preview" className="w-full h-full object-cover" /></div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur h-full min-h-[280px] flex flex-col md:col-start-1 md:row-start-3">
            <h3 className="text-lg font-medium mb-4">Step 3: Property Details</h3>
            {["house","apartment"].includes(catKey()) ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow">
                <Input label="Bedrooms" value={form.extras?.bedrooms || ''} onChange={v=> setExtra('bedrooms', v)} error={errors.bedrooms} />
                <Input label="Bathrooms" value={form.extras?.bathrooms || ''} onChange={v=> setExtra('bathrooms', v)} error={errors.bathrooms} />
                <Toggle label="Garage" checked={!!form.extras?.garage} onChange={v=> setExtra('garage', v)} />
                <Toggle label="Garden" checked={!!form.extras?.garden} onChange={v=> setExtra('garden', v)} />
                <Input label="Area (sqm)" value={form.extras?.area_sqm || ''} onChange={v=> setExtra('area_sqm', v)} error={errors.area_sqm} />
              </div>
            ) : catKey()==='car' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-grow">
                <Input label="Colour" value={form.extras?.colour || ''} onChange={v=> setExtra('colour', v)} />
                <Input label="Mileage" value={form.extras?.mileage || ''} onChange={v=> setExtra('mileage', v)} />
                <Select label="Transmission" value={form.extras?.transmission || ''} options={['automatic','manual']} onChange={v=> setExtra('transmission', v)} error={errors.transmission} />
                <Input label="Engine Size" value={form.extras?.engine_size || ''} onChange={v=> setExtra('engine_size', v)} />
                <Input label="Year" value={form.extras?.year || ''} onChange={v=> setExtra('year', v)} error={errors.year} />
                <Select label="Fuel Type" value={form.extras?.fuel_type || ''} options={['petrol','diesel','hybrid','electric']} onChange={v=> setExtra('fuel_type', v)} />
              </div>
            ) : (
              <div className="text-sm text-gray-400">Select a category to see relevant fields.</div>
            )}
            {(form.transaction_type||'').toLowerCase()==='rent' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {catKey()==='apartment' && (
                  <Select label="Rent Period" value={form.extras?.rent_period || ''} options={['daily','weekly','monthly']} onChange={v=> setExtra('rent_period', v)} error={errors.rent_period} />
                )}
                {catKey()==='house' && (
                  <Select label="Rent Period" value={form.extras?.rent_period || ''} options={['monthly','yearly']} onChange={v=> setExtra('rent_period', v)} error={errors.rent_period} />
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur h-full min-h-[120px] flex flex-col items-center justify-center gap-2 md:col-span-2 md:row-start-4">
            {Object.keys(errors).length > 0 && (
              <div className="text-rose-300 text-sm">Please fix the highlighted fields above.</div>
            )}
            <button type="submit" onClick={submit} className="px-8 py-3 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 transition disabled:opacity-60" disabled={loading}>{loading ? 'Publishing…' : 'Publish'}</button>
          </div>
        </form>
        {modal.open && modal.type !== 'progress' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 p-5">
              <h4 className={`text-lg font-semibold mb-2 ${modal.type==='success' ? 'text-emerald-400' : modal.type==='error' ? 'text-rose-400' : 'text-gray-200'}`}>{modal.title}</h4>
              <p className="text-sm text-gray-300 mb-4">{modal.message}</p>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600" onClick={()=> setModal(m=> ({ ...m, open: false }))}>Close</button>
                {modal.type==='success' && (
                  <button className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500" onClick={()=> window.location.href='/admin'}>Go to Dashboard</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Input({ label, onChange, error, ...rest }) {
  return (
    <label className="text-sm text-gray-300 flex flex-col gap-1">
      <span>{label}</span>
      <input className={`rounded bg-gray-800 text-gray-100 placeholder-gray-400 p-2 focus:outline-none focus:ring-2 ${error ? 'ring-2 ring-rose-400' : 'focus:ring-purple-500'}`} onChange={e=> onChange?.(e.target.value)} {...rest} />
      {error && <span className="text-rose-400 text-xs">{error}</span>}
    </label>
  )
}
function Select({ label, options = [], onChange, onChangeValue, required, icon, value, error }) {
  return (
    <label className="text-sm text-gray-300 flex flex-col gap-1">
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
      <select className={`rounded bg-gray-800/60 text-gray-100 p-2 focus:outline-none focus:ring-2 ${error ? 'ring-2 ring-rose-400' : 'focus:ring-purple-500'}`} value={value ?? ''} onChange={e=> {
        const val = e.target.value;
        const opt = options.find(o => (typeof o === 'string' ? o === val : String(o.value) === String(val)));
        const labelText = typeof opt === 'string' ? opt : (opt?.label ?? '');
        onChangeValue?.(val);
        onChange?.(labelText || val);
      }} aria-required={required}>
        <option value="">Select</option>
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
      {error && <span className="text-rose-400 text-xs">{error}</span>}
    </label>
  )
}
function Toggle({ label, onChange, checked }) {
  return (
    <label className="text-sm text-gray-300 flex items-center gap-2">
      <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={!!checked} onChange={e=> onChange?.(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function TagsInput({ label, value, setValue, placeholder }) {
  const [input, setInput] = useState('')
  const tags = useMemo(() => (Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',').map(s=>s.trim()).filter(Boolean) : [])), [value])
  function addTag(tag) {
    if (!tag) return
    const newTags = Array.from(new Set([...tags, tag]))
    setValue(newTags.join(', '))
    setInput('')
  }
  function removeTag(tag) {
    const newTags = tags.filter(t => t !== tag)
    setValue(newTags.join(', '))
  }
  return (
    <div>
      <label className="text-sm text-gray-300 flex flex-col gap-1">
        <span>{label}</span>
        <div className="rounded bg-gray-800/60 text-gray-100 p-2 flex flex-wrap gap-2 min-h-[42px]">
          {tags.map(t => (
            <span key={t} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-purple-600/20 text-purple-200 border border-purple-600/30 text-xs">
              {t}
              <button type="button" className="hover:text-white" onClick={()=> removeTag(t)}>×</button>
            </span>
          ))}
          <input
            value={input}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none"
            onChange={e=> setInput(e.target.value)}
            onKeyDown={e=> {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input.trim()) }
              if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length-1])
            }}
          />
        </div>
      </label>
    </div>
  )
}
