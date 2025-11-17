import { useEffect, useState } from 'react'
import { getCategories, getListingsPublic, getProvinces, getCities, getTerritories } from '../lib/api'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import PublicFooter from '../components/PublicFooter'
import { useTranslation } from 'react-i18next'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

export default function Home() {
  const { t } = useTranslation()
  const locationRouter = useLocation()
  const [categories, setCategories] = useState([])
  const [listings, setListings] = useState({ data: [], links: {}, meta: {} })
  const [filters, setFilters] = useState({ category_id: '', type: '', min_price: '', max_price: '' })
  const [sidebarFilter, setSidebarFilter] = useState('all') // 'all' | 'vehicles' | 'real_estate' | 'electronics' | 'furniture' | 'jobs'
  const [brokerFilter, setBrokerFilter] = useState('')

  const [country, setCountry] = useState('') // 'RW' | 'DRC'
  const [provinceId, setProvinceId] = useState('')
  const [cityId, setCityId] = useState('')
  const [territoryId, setTerritoryId] = useState('')

  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const [territories, setTerritories] = useState([])

  // Read broker filter from URL (?broker=ID)
  useEffect(() => {
    const params = new URLSearchParams(locationRouter.search)
    const broker = params.get('broker')
    if (broker) {
      setBrokerFilter(broker)
    } else {
      setBrokerFilter('')
    }
  }, [locationRouter.search])

  useEffect(() => {
    ;(async () => {
      const cats = await getCategories()
      setCategories(cats.data || [])
      const baseParams = {}
      if (brokerFilter) baseParams.broker_id = brokerFilter
      const lst = await getListingsPublic(baseParams)
      setListings(lst)
    })()
  }, [brokerFilter])

  // When country changes, load provinces for that country and reset deeper levels
  useEffect(() => {
    (async () => {
      if (!country) {
        setProvinces([])
        setProvinceId('')
        setCities([])
        setTerritories([])
        setCityId('')
        setTerritoryId('')
        return
      }
      const res = await getProvinces(country)
      setProvinces(res.data || [])
      setProvinceId('')
      setCities([])
      setTerritories([])
      setCityId('')
      setTerritoryId('')
    })()
  }, [country])

  // When a DRC province changes, load cities and territories
  useEffect(() => {
    (async () => {
      if (country !== 'DRC' || !provinceId) {
        setCities([])
        setTerritories([])
        setCityId('')
        setTerritoryId('')
        return
      }
      const [citiesRes, territoriesRes] = await Promise.all([
        getCities(provinceId),
        getTerritories(provinceId),
      ])
      setCities(citiesRes.data || [])
      setTerritories(territoriesRes.data || [])
      setCityId('')
      setTerritoryId('')
    })()
  }, [country, provinceId])

  async function applyFilters(e) {
    e.preventDefault()
    const params = {}

    // Basic filters
    for (const k of Object.keys(filters)) {
      if (filters[k] !== '') params[k] = filters[k]
    }

    // Location composed from structured selectors
    const pieces = []
    if (country === 'RW') pieces.push('Rwanda')
    if (country === 'DRC') pieces.push('DRC')

    if (provinceId) {
      const p = provinces.find(p => String(p.id) === String(provinceId))
      if (p?.name) pieces.push(p.name)
    }

    if (country === 'DRC') {
      if (cityId) {
        const c = cities.find(c => String(c.id) === String(cityId))
        if (c?.name) pieces.push(c.name + ' City')
      }
      if (territoryId) {
        const t = territories.find(t => String(t.id) === String(territoryId))
        if (t?.name) pieces.push(t.name + ' Territory')
      }
    }

    if (pieces.length > 0) {
      params.location = pieces.join(' - ')
    }

    if (brokerFilter) {
      params.broker_id = brokerFilter
    }

    const lst = await getListingsPublic(params)
    setListings(lst)
  }

  function getListingImage(item) {
    const first = (item.images && item.images[0]) || null
    if (!first || !first.file_path) return null
    if (first.file_path.startsWith('http')) return first.file_path
    return `${BACKEND_URL}/storage/${first.file_path}`
  }

  const rawItems = Array.isArray(listings.data) ? listings.data : []
  const featured = rawItems[0] || null

  // Filter listings based on sidebar category selection
  const displayListings = rawItems.filter(item => {
    if (sidebarFilter === 'all') return true
    const name = (item.category?.name || '').toLowerCase()
    if (sidebarFilter === 'vehicles') {
      return ['vehicle', 'vehicles', 'car', 'cars', 'auto', 'automotive'].some(k => name.includes(k))
    }
    if (sidebarFilter === 'real_estate') {
      return ['house', 'houses', 'apartment', 'real estate', 'property'].some(k => name.includes(k))
    }
    if (sidebarFilter === 'electronics') {
      return [
        'electronic',
        'electronics',
        'computer',
        'computers',
        'laptop',
        'laptops',
        'phone',
        'phones',
        'smartphone',
        'smartphones',
        'mobile',
        'camera',
        'cameras',
        'cctv',
      ].some(k => name.includes(k))
    }
    if (sidebarFilter === 'furniture') {
      return [
        'furniture',
        'furnitures',
        'sofa',
        'sofas',
        'couch',
        'couches',
        'bed',
        'beds',
        'bedroom',
        'mattress',
        'wardrobe',
        'closet',
        'kitchen',
        'dining',
        'table',
        'chairs',
      ].some(k => name.includes(k))
    }
    if (sidebarFilter === 'jobs') {
      return ['job', 'jobs', 'service', 'services'].some(k => name.includes(k))
    }
    return true
  })
  // Use a fixed banner image so the welcome section clearly introduces BestUmuranga
  // instead of changing with each listing.
  const heroImg =
    'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=1600'

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      {/* Hero banner */}
      <section className="relative w-full bg-slate-950">
        <div className="relative h-[360px] md:h-[420px] lg:h-[440px] overflow-hidden">
          {/* Background image + soft gradient */}
          <img
            src={heroImg}
            alt={featured?.title || 'Modern apartment'}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />

          {/* Hero content */}
          <div className="relative max-w-6xl mx-auto h-full px-4 lg:px-8 flex items-center justify-center">
            <div className="max-w-xl text-white space-y-4 text-center">
              <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-orange-300">
                {t('home.hero_welcome')}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
                {t('home.hero_title')}
              </h1>
              <p className="text-sm md:text-base text-slate-200/90 max-w-md">
                {t('home.hero_subtitle')}
              </p>
              <div className="pt-1 flex justify-center">
                <a
                  href="#promoted-ads"
                  className="inline-flex items-center rounded-full bg-amber-400 px-4 py-2 text-xs md:text-sm font-semibold text-slate-900 hover:bg-amber-300 shadow-md shadow-black/30"
                >
                  View listings
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar overlay */}
        <div className="relative max-w-6xl mx-auto px-4 lg:px-8 -mt-14 md:-mt-16">
          <form
            onSubmit={applyFilters}
            className="rounded-xl md:rounded-full bg-white shadow-xl shadow-black/25 border border-slate-200 px-3 py-3 md:px-5 md:py-4 flex flex-col md:flex-row gap-2 md:gap-3 items-stretch md:items-center"
          >
            {/* Country */}
            <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0 md:pr-3">
              <span className="hidden md:inline text-[11px] font-semibold text-slate-500 uppercase">{t('home.search_country')}</span>
              <select
                className="bg-transparent text-xs md:text-sm outline-none"
                value={country}
                onChange={e => setCountry(e.target.value)}
              >
                <option value="">Select country</option>
                <option value="RW">Rwanda</option>
                <option value="DRC">DR Congo</option>
              </select>
            </div>

            {/* Province */}
            <div className="flex-1 flex items-center gap-2 border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0 md:px-3">
              <span className="hidden md:inline text-[11px] font-semibold text-slate-500 uppercase">{t('home.search_province')}</span>
              <select
                className="flex-1 bg-transparent text-xs md:text-sm outline-none"
                value={provinceId}
                onChange={e => setProvinceId(e.target.value)}
                disabled={!country || provinces.length === 0}
              >
                <option value="">All provinces</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* City / Territory for DRC */}
            {country === 'DRC' && (
              <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0 md:px-3">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1">
                      <span className="hidden md:inline text-[11px] font-semibold text-slate-500 uppercase">{t('home.search_city')}</span>
                      <select
                        className="flex-1 bg-transparent text-[11px] md:text-xs outline-none"
                        value={cityId}
                        onChange={e => setCityId(e.target.value)}
                        disabled={cities.length === 0}
                      >
                        <option value="">All cities</option>
                        {cities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <span className="hidden md:inline text-[11px] font-semibold text-slate-500 uppercase">{t('home.search_territory')}</span>
                      <select
                        className="flex-1 bg-transparent text-[11px] md:text-xs outline-none"
                        value={territoryId}
                        onChange={e => setTerritoryId(e.target.value)}
                        disabled={territories.length === 0}
                      >
                        <option value="">All territories</option>
                        {territories.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category */}
            <div className="flex-1 flex items-center gap-2 pb-1 md:pb-0 md:px-3">
              <span className="hidden md:inline text-[11px] font-semibold text-slate-500 uppercase">{t('home.search_category')}</span>
              <select
                className="flex-1 bg-transparent text-xs md:text-sm outline-none"
                value={filters.category_id}
                onChange={e => setFilters(f => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">All categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 md:pl-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 text-xs md:text-sm font-semibold shadow-md shadow-orange-500/40"
              >
                {t('home.search_button')}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Promoted ads section with sidebar */}
      <section id="promoted-ads" className="bg-white flex-1">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-10 pt-12">
          <div className="mb-6 flex flex-col items-center text-center">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">{t('home.promoted_title')}</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">{t('home.promoted_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
            {/* Sidebar: categories & subcategories */}
            <aside className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 md:p-4 text-xs md:text-sm text-slate-800 h-fit shadow-sm lg:sticky lg:top-28 lg:self-start">
              <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-3">{t('home.sidebar_categories')}</h3>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSidebarFilter('all')}
                  className={`flex items-center justify-between rounded-full px-3 py-1.5 text-xs md:text-sm border transition
                    ${sidebarFilter === 'all'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50'}`}
                >
                  <span className="font-semibold">{t('home.sidebar_all')}</span>
                </button>

                <div className="pt-1 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSidebarFilter('vehicles')}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs md:text-sm transition
                      ${sidebarFilter === 'vehicles'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : 'bg-white text-slate-800 border border-slate-200 hover:bg-sky-50'}`}
                  >
                    <span className="font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      Vehicles
                    </span>
                  </button>
                  <ul className="ml-4 text-[11px] md:text-xs text-slate-600 space-y-0.5">
                    <li
                      className="cursor-pointer hover:text-sky-700"
                      onClick={() => setSidebarFilter('vehicles')}
                    >
                      Cars for sale
                    </li>
                    <li
                      className="cursor-pointer hover:text-sky-700"
                      onClick={() => setSidebarFilter('vehicles')}
                    >
                      {t('home.sidebar_vehicles_rent')}
                    </li>
                    <li
                      className="cursor-pointer hover:text-sky-700"
                      onClick={() => setSidebarFilter('vehicles')}
                    >
                      {t('home.sidebar_vehicles_parts')}
                    </li>
                    <li
                      className="cursor-pointer hover:text-sky-700"
                      onClick={() => setSidebarFilter('vehicles')}
                    >
                      {t('home.sidebar_vehicles_wheels')}
                    </li>
                  </ul>
                </div>

                <div className="pt-1 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSidebarFilter('electronics')}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs md:text-sm transition
                      ${sidebarFilter === 'electronics'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        : 'bg-white text-slate-800 border border-slate-200 hover:bg-indigo-50'}`}
                  >
                    <span className="font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Electronics
                    </span>
                  </button>
                  <ul className="ml-4 text-[11px] md:text-xs text-slate-600 space-y-0.5">
                    <li
                      className="cursor-pointer hover:text-indigo-700"
                      onClick={() => setSidebarFilter('electronics')}
                    >
                      {t('home.sidebar_electronics_computers')}
                    </li>
                    <li
                      className="cursor-pointer hover:text-indigo-700"
                      onClick={() => setSidebarFilter('electronics')}
                    >
                      {t('home.sidebar_electronics_phones')}
                    </li>
                    <li
                      className="cursor-pointer hover:text-indigo-700"
                      onClick={() => setSidebarFilter('electronics')}
                    >
                      {t('home.sidebar_electronics_cameras')}
                    </li>
                    <li
                      className="cursor-pointer hover:text-indigo-700"
                      onClick={() => setSidebarFilter('electronics')}
                    >
                      {t('home.sidebar_electronics_cctv')}
                    </li>
                  </ul>
                </div>

                <div className="pt-1 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSidebarFilter('furniture')}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs md:text-sm transition
                      ${sidebarFilter === 'furniture'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-white text-slate-800 border border-slate-200 hover:bg-rose-50'}`}
                  >
                    <span className="font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Furniture
                    </span>
                  </button>
                  <ul className="ml-4 text-[11px] md:text-xs text-slate-600 space-y-0.5">
                    <li
                      className="cursor-pointer hover:text-rose-700"
                      onClick={() => setSidebarFilter('furniture')}
                    >
                      {t('home.sidebar_furniture_bedroom')}
                    </li>
                    <li
                      className="cursor-pointer hover:text-rose-700"
                      onClick={() => setSidebarFilter('furniture')}
                    >
                      {t('home.sidebar_furniture_kitchen')}
                    </li>
                    <li
                      className="cursor-pointer hover:text-rose-700"
                      onClick={() => setSidebarFilter('furniture')}
                    >
                      {t('home.sidebar_furniture_living')}
                    </li>
                    <li
                      className="cursor-pointer hover:text-rose-700"
                      onClick={() => setSidebarFilter('furniture')}
                    >
                      {t('home.sidebar_furniture_office')}
                    </li>
                  </ul>
                </div>

                <div className="pt-1 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSidebarFilter('real_estate')}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs md:text-sm transition
                      ${sidebarFilter === 'real_estate'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-white text-slate-800 border border-slate-200 hover:bg-emerald-50'}`}
                  >
                    <span className="font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Real estate
                    </span>
                  </button>
                  <ul className="ml-4 text-[11px] md:text-xs text-slate-600 space-y-0.5">
                    <li
                      className="cursor-pointer hover:text-emerald-700"
                      onClick={() => setSidebarFilter('real_estate')}
                    >
                      Houses for sale
                    </li>
                    <li
                      className="cursor-pointer hover:text-emerald-700"
                      onClick={() => setSidebarFilter('real_estate')}
                    >
                      {t('home.sidebar_real_estate_rent')}
                    </li>
                  </ul>
                </div>

                <div className="pt-1 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSidebarFilter('jobs')}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs md:text-sm transition
                      ${sidebarFilter === 'jobs'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-white text-slate-800 border border-slate-200 hover:bg-amber-50'}`}
                  >
                    <span className="font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Jobs & services
                    </span>
                  </button>
                  <ul className="ml-4 text-[11px] md:text-xs text-slate-600 space-y-0.5">
                    <li>Jobs</li>
                    <li>Business services</li>
                  </ul>
                </div>
              </div>
            </aside>

            {/* Listings grid: max 3 columns */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayListings.map(item => {
              const imgSrc = getListingImage(item)
              const catName = item.category?.name ? item.category.name.toLowerCase() : ''
              const isHouse = ['house','houses','apartment'].some(k => catName.includes(k))
              const rawAttrs = item.attributes
              const attrs = typeof rawAttrs === 'string' ? (() => { try { return JSON.parse(rawAttrs) } catch { return {} } })() : (rawAttrs || {})
              const beds = attrs.bedrooms
              const baths = attrs.bathrooms
              const area = attrs.area_sqm

              return (
                <Link
                  to={`/listing/${item.id}`}
                  key={item.id}
                  className="group rounded-2xl bg-white border border-slate-200 overflow-hidden hover:border-orange-400/80 hover:shadow-lg hover:shadow-orange-400/20 transition flex flex-col"
                >
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[11px] text-slate-400">
                        No image
                      </div>
                    )}
                    {item.type && (
                      <span className="absolute top-2 right-2 rounded-sm bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        {item.type === 'rent' ? 'For rent' : 'For sale'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 p-3 flex flex-col gap-1.5">
                    <div className="text-xs font-semibold text-slate-900 line-clamp-2 min-h-[32px]">
                      {item.title}
                    </div>
                    {item.price != null && (
                      <div className="text-sm font-semibold text-sky-600">
                        ${Number(item.price).toLocaleString()}
                        {item.type === 'rent' && <span className="text-[11px] font-normal text-slate-500">/mo</span>}
                      </div>
                    )}

                    {/* House-style attributes row */}
                    {isHouse && (
                      <div className="mt-1 flex items-center gap-5 text-[12px] text-slate-600">
                        {/* Beds icon + count */}
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4.5 h-4.5 text-slate-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect x="3" y="10" width="18" height="7" rx="1" className="fill-current opacity-80" />
                            <rect x="5" y="7" width="5" height="3" rx="1" className="fill-current opacity-60" />
                            <rect x="11" y="7" width="8" height="3" rx="1" className="fill-current opacity-60" />
                          </svg>
                          <span className="font-semibold">{beds != null ? beds : '-'}</span>
                          <span className="text-slate-400">Beds</span>
                        </div>

                        {/* Baths icon + count */}
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5 text-slate-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 11V8.5A2.5 2.5 0 0 1 8.5 6h0A2.5 2.5 0 0 1 11 8.5V11"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                            <rect x="4" y="11" width="16" height="5" rx="1" className="fill-current opacity-80" />
                          </svg>
                          <span className="font-semibold">{baths != null ? baths : '-'}</span>
                          <span className="text-slate-400">Baths</span>
                        </div>

                        {/* Area icon + value */}
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5 text-slate-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect x="4" y="5" width="14" height="12" rx="1" className="fill-current opacity-80" />
                            <path d="M8 9h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                            <path d="M8 12h4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          <span className="font-semibold">{area != null ? area : '-'}</span>
                          <span className="text-slate-400">Sq m</span>
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-2">
                      <span className="truncate max-w-[60%]">{item.location || 'Location not specified'}</span>
                      {item.category && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-50 text-[10px] text-slate-700 border border-slate-200">
                          {item.category.name || 'Listing'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
