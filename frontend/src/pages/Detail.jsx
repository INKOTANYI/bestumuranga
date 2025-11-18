import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getListing, createInquiry } from '../lib/api'
import { toast } from 'sonner'
import PublicHeaderClean from '../components/PublicHeaderClean'
import PublicFooter from '../components/PublicFooter'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

export default function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [contact, setContact] = useState({ name: '', phone: '', email: '', message: '', topic: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await getListing(id)
      setItem(res.data)
      setActiveIndex(0)
    })()
  }, [id])

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <PublicHeaderClean />
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">Loading listing…</div>
        <PublicFooter />
      </div>
    )
  }

  const images = Array.isArray(item.images) ? item.images : []
  const hasImages = images.length > 0
  const mainImg = hasImages ? images[Math.min(activeIndex, images.length - 1)] : null
  const mainSrc = mainImg
    ? (mainImg.file_path?.startsWith('http') ? mainImg.file_path : `${BACKEND_URL}/storage/${mainImg.file_path}`)
    : null

  const rawAttrs = item.attributes
  const attrs = typeof rawAttrs === 'string' ? (() => { try { return JSON.parse(rawAttrs) } catch { return {} } })() : (rawAttrs || {})
  const catName = item.category?.name || 'Property'
  const isHouse = ['house','houses','apartment'].some(k => catName.toLowerCase().includes(k))

  const beds = attrs.bedrooms
  const baths = attrs.bathrooms
  const area = attrs.area_sqm
  const garage = attrs.garage
  const year = attrs.year || attrs.year_built

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = item.title ? `Check out this listing: ${item.title}` : 'Check out this listing'

  function getWhatsappLink() {
    const raw = item.user?.phone || ''
    const digits = raw.replace(/[^0-9]/g, '')
    if (!digits) return ''
    return `https://wa.me/${digits}`
  }

  async function submitInquiry(e) {
    e.preventDefault()
    if (!item?.user?.id) {
      toast.error('Broker information is missing for this listing.', { duration: 3000 })
      return
    }
    if (!contact.phone.trim() || !contact.email.trim()) {
      toast.error('Please provide your phone and email so the broker can contact you.', { duration: 3500 })
      return
    }
    if (!contact.message.trim()) {
      toast.error('Please write a short message for the broker.', { duration: 3000 })
      return
    }
    try {
      setSending(true)
      await createInquiry({
        broker_id: item.user.id,
        listing_id: item.id,
        category_id: item.category_id,
        details: contact.message,
        client_name: contact.name || undefined,
        client_phone: contact.phone || undefined,
        client_email: contact.email || undefined,
      })
      toast.success('Your message was sent to the broker. We have your contact and will reach out as soon as possible.', {
        duration: 3000,
        className: 'bg-slate-900 text-white text-xs md:text-sm border border-emerald-500/60 shadow-lg shadow-emerald-500/30',
      })
      setContact(c => ({ ...c, message: '' }))
    } catch (err) {
      const msg = err?.response?.data?.message || 'Unable to send your message right now.'
      toast.error(msg, {
        duration: 4000,
        className: 'bg-slate-900 text-white text-xs md:text-sm border border-red-500/60 shadow-lg shadow-red-500/30',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <PublicHeaderClean />
      <div className="flex-1 max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8 flex flex-col lg:flex-row gap-6">
        {/* Left: gallery + details */}
        <div className="flex-1 min-w-0">
          {/* Title + price */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                {item.title}
              </h1>
              {item.price != null && (
                <div className="text-lg md:text-xl font-semibold text-sky-600">
                  ${Number(item.price).toLocaleString()}
                  {item.type === 'rent' && <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>}
                </div>
              )}
            </div>
            <div className="text-xs md:text-sm text-slate-500 flex flex-wrap gap-2">
              <span>{item.location || 'Location not specified'}</span>
              {item.type && (
                <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[11px] font-medium uppercase text-slate-600">
                  {item.type === 'rent' ? 'For rent' : 'For sale'}
                </span>
              )}
            </div>
          </div>

          {/* Main image */}
          <div className="bg-slate-200 rounded-md overflow-hidden mb-3 relative">
            {mainSrc ? (
              <img
                src={mainSrc}
                alt={item.title}
                className="w-full h-[260px] md:h-[320px] lg:h-[360px] object-cover"
              />
            ) : (
              <div className="w-full h-[260px] md:h-[320px] lg:h-[360px] flex items-center justify-center text-slate-400 text-sm">
                No image available
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {hasImages && images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {images.map((img, idx) => {
                const thumbSrc = img.file_path?.startsWith('http')
                  ? img.file_path
                  : `${BACKEND_URL}/storage/${img.file_path}`
                return (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative h-14 w-20 flex-shrink-0 rounded-md overflow-hidden border ${idx === activeIndex ? 'border-sky-500' : 'border-slate-200'}`}
                  >
                    <img src={thumbSrc} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Overview */}
          <div className="bg-white rounded-md shadow-sm border border-slate-200 mb-4">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Overview</h2>
            </div>
            <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm text-slate-700">
              <div>
                <div className="text-[11px] uppercase text-slate-400">Property Type</div>
                <div className="font-semibold">{catName}</div>
              </div>
              {isHouse && (
                <>
                  <div>
                    <div className="text-[11px] uppercase text-slate-400">Bedrooms</div>
                    <div className="font-semibold">{beds != null ? beds : '-'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-slate-400">Bathrooms</div>
                    <div className="font-semibold">{baths != null ? baths : '-'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-slate-400">Area Size</div>
                    <div className="font-semibold">{area != null ? `${area} Sq m` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-slate-400">Garage</div>
                    <div className="font-semibold">{garage ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-slate-400">Year Built</div>
                    <div className="font-semibold">{year || '-'}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-md shadow-sm border border-slate-200 mb-10">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Description</h2>
            </div>
            <div className="px-4 py-4 text-sm text-slate-700 whitespace-pre-wrap break-words">
              {item.description || 'No description provided.'}
            </div>
          </div>
        </div>

        {/* Right: sticky broker info + contact form */}
        <div className="w-full lg:w-80">
          <div className="lg:sticky lg:top-20">
            <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4">
              {item.user && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                      {item.user.name?.[0] || 'B'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">{item.user.name || 'Broker'}</span>
                      {item.user.phone && (
                        <span className="text-[11px] text-slate-500">{item.user.phone}</span>
                      )}
                      <button
                        type="button"
                        className="mt-0.5 text-[11px] text-sky-600 hover:underline text-left"
                        onClick={() => {
                          if (item.user?.id) {
                            navigate(`/?broker=${item.user.id}#promoted-ads`)
                          }
                        }}
                      >
                        View Listings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact form */}
              <form className="space-y-2" onSubmit={submitInquiry}>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full rounded border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={contact.name}
                  onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  className="w-full rounded border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={contact.phone}
                  onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={contact.email}
                  onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                />
                <textarea
                  rows={3}
                  placeholder={`Hello, I am interested in [${item.title}]`}
                  className="w-full rounded border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={contact.message}
                  onChange={e => setContact(c => ({ ...c, message: e.target.value }))}
                />
                <select
                  className="w-full rounded border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={contact.topic}
                  onChange={e => setContact(c => ({ ...c, topic: e.target.value }))}
                >
                  <option value="" disabled>Select topic</option>
                  <option value="visit">Request a visit</option>
                  <option value="more-info">More information</option>
                </select>

                <p className="text-[10px] text-slate-500 mt-1">
                  By submitting this form I agree to the <button type="button" className="text-sky-600 hover:underline">Terms of Use</button>.
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 inline-flex items-center justify-center rounded bg-orange-500 text-white text-xs font-semibold py-2 hover:bg-orange-600 disabled:opacity-60"
                  >
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded border border-orange-500 text-orange-500 text-xs font-semibold px-3 py-2 hover:bg-orange-50"
                  >
                    Call
                  </button>
                </div>

                {getWhatsappLink() && (
                  <a
                    href={`${getWhatsappLink()}?text=${encodeURIComponent(`Hello, I am interested in ${item.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full inline-flex items-center justify-center rounded border border-green-500 text-green-600 text-xs font-semibold py-2 hover:bg-green-50"
                  >
                    WhatsApp
                  </a>
                )}

                {/* Social share buttons */}
                {shareUrl && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Share this listing</div>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded bg-green-500/90 text-white px-2.5 py-1 hover:bg-green-600"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded bg-sky-600 text-white px-2.5 py-1 hover:bg-sky-700"
                      >
                        Facebook
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded bg-slate-900 text-white px-2.5 py-1 hover:bg-black"
                      >
                        X / Twitter
                      </a>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
