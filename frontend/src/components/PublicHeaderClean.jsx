import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { login, me } from '../lib/api'

export default function PublicHeaderClean() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginTouched, setLoginTouched] = useState({})

  function validEmail(v) { return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v) }
  const loginFieldErrors = {
    email: !loginEmail ? 'Email is required' : (!validEmail(loginEmail) ? 'Enter a valid email' : ''),
    password: !loginPassword ? 'Password is required' : ''
  }
  const loginIsValid = Object.values(loginFieldErrors).every(v => v === '')

  async function submitLogin(e) {
    e.preventDefault()
    setLoginError('')
    if (!loginIsValid) {
      setLoginTouched({ email: true, password: true })
      return
    }
    try {
      setLoginLoading(true)
      await login(loginEmail, loginPassword)
      const fresh = await me()
      const role = fresh?.user?.role
      setShowAuthModal(false)
      if (role === 'admin') navigate('/admin', { replace: true })
      else if (role === 'broker') navigate('/broker', { replace: true })
      else navigate('/', { replace: true })
    } catch (e) {
      setLoginError(e?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoginLoading(false)
    }
  }

  function changeLanguage(e) {
    const value = e.target.value
    if (value) i18n.changeLanguage(value)
  }

  return (
    <header className="w-full sticky top-0 z-40 text-white">
      {/* Top bar: offices + follow us */}
      <div className="w-full bg-gradient-to-r from-sky-950 via-sky-900 to-sky-800 border-b border-sky-950/60">
        <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-6 h-8 flex items-center justify-between text-[11px] md:text-[12px]">
          {/* Offices */}
          <div className="flex-1 flex items-center text-sky-100/90">
            <span className="font-semibold tracking-wide mr-2">
              Visit our offices:
            </span>
            <span className="font-medium text-sky-50">
              KIGALI | GOMA | RUBAVU | BUKAVU | KAMEMBE | UVILA
            </span>
          </div>

          {/* Follow us + social icons */}
          <div className="flex items-center gap-2 text-sky-100/90">
            <span className="hidden sm:inline text-[11px] mr-1">
              Follow us on social media
            </span>
            <a
              href="#"
              className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-sky-400/80 bg-sky-900/60 text-[11px] font-semibold text-sky-100 hover:bg-sky-700 hover:border-sky-200 transition"
              aria-label="Facebook"
            >
              F
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-sky-400/80 bg-sky-900/60 text-[11px] font-semibold text-sky-100 hover:bg-sky-700 hover:border-sky-200 transition"
              aria-label="Instagram"
            >
              I
            </a>
            <a
              href="https://wa.me/250783163187"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-emerald-400/80 bg-emerald-600/80 text-[11px] font-semibold text-white hover:bg-emerald-500 hover:border-emerald-200 transition"
              aria-label="WhatsApp"
            >
              W
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar (copied style) */}
      <div className="w-full bg-sky-800/98 backdrop-blur border-b border-sky-900">
        <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-6 h-16 md:h-20 flex items-center justify-between gap-3 md:gap-4">
          {/* Logo / brand */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/10 flex items-center justify-center border border-cyan-300/70 shadow-sm shadow-black/30">
              <span className="text-[13px] md:text-sm font-bold text-cyan-200">B</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm md:text-lg font-semibold tracking-wide">
                <span className="text-white">Best</span>
                <span className="text-amber-300">Umuranga</span>
                <span className="hidden sm:inline text-[11px] md:text-xs text-sky-100/80 ml-1 align-middle">
                  .com
                </span>
              </span>
              <span className="hidden md:inline text-[11px] md:text-xs text-sky-100/80">
                {t('brand.tagline')}
              </span>
            </div>
          </Link>

          {/* Main navigation */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] lg:text-[14px] font-semibold">
            <Link
              to="/"
              className={onHome ? 'text-amber-300' : 'text-sky-100/80 hover:text-white'}
            >
              {t('nav.home')}
            </Link>
            <a
              href="#promoted-ads"
              className="text-sky-100/80 hover:text-white"
            >
              View listings
            </a>
            <button className="text-sky-100/80 hover:text-white" type="button">
              {t('nav.properties')}
            </button>
            <button className="text-sky-100/80 hover:text-white" type="button">
              {t('nav.realtor')}
            </button>
            <button className="text-sky-100/80 hover:text-white" type="button">
              {t('nav.others')}
            </button>
          </nav>

          {/* Right side: language + phone + CTA */}
          <div className="flex items-center gap-2 md:gap-3">
            <select
              onChange={changeLanguage}
              value={i18n.language}
              className="hidden sm:inline-block bg-sky-900/70 border border-sky-600 rounded-full px-2 py-1 text-[10px] md:text-[11px] text-sky-50 focus:outline-none"
            >
              <option value="en">EN</option>
              <option value="rw">RW</option>
              <option value="fr">FR</option>
              <option value="sw">SW</option>
            </select>
            <div className="hidden sm:flex flex-col leading-tight text-[10px] md:text-[11px]">
              <span className="uppercase text-sky-100/80 tracking-wide">CALL US</span>
              <span className="font-semibold text-amber-200">+250 783 163 187</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center rounded-full bg-amber-400 px-3.5 py-1.5 text-[12px] md:text-[13px] font-semibold text-slate-900 hover:bg-amber-300 shadow-md shadow-black/30"
            >
              Post a free listing
            </button>
          </div>
        </div>
      </div>

      {/* Auth modal: two-column layout, login + register promo */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden transform transition-all duration-200 ease-out scale-100">
            {/* Close button */}
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 w-7 h-7 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: login form */}
              <div className="px-6 pb-6 md:px-8 md:pb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  <span className="text-[11px] font-medium text-sky-800">BestUmuranga</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Welcome back!</h2>
                <p className="text-[11px] md:text-xs text-slate-600 mb-4">Login to post or manage your listings.</p>

                <form onSubmit={submitLogin} className="grid gap-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      onBlur={() => setLoginTouched(t => ({ ...t, email: true }))}
                      className={`border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${loginTouched.email && loginFieldErrors.email ? 'border-rose-500' : 'border-gray-300'}`}
                      required
                    />
                    {loginTouched.email && loginFieldErrors.email && (
                      <div className="text-rose-600 text-[11px] mt-1">{loginFieldErrors.email}</div>
                    )}
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      onBlur={() => setLoginTouched(t => ({ ...t, password: true }))}
                      className={`border rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${loginTouched.password && loginFieldErrors.password ? 'border-rose-500' : 'border-gray-300'}`}
                      required
                    />
                    {loginTouched.password && loginFieldErrors.password && (
                      <div className="text-rose-600 text-[11px] mt-1">{loginFieldErrors.password}</div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading || !loginIsValid}
                    className="mt-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed w-full"
                  >
                    {loginLoading ? 'Signing in...' : 'Login'}
                  </button>
                  {loginError && <div className="text-red-600 text-[11px] mt-1">{loginError}</div>}
                </form>
              </div>

              {/* Right: register promo */}
              <div className="relative flex items-center justify-center px-6 py-8 md:px-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_60%)]" />
                <div className="relative text-center space-y-3">
                  <h3 className="text-lg md:text-xl font-semibold">Don't have an account?</h3>
                  <p className="text-xs md:text-sm text-indigo-50 max-w-xs mx-auto">
                    Start your journey in one click. Create a broker account and start posting free listings.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setShowAuthModal(false); navigate('/register-broker') }}
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-white/95 hover:bg-white text-xs md:text-sm font-semibold text-indigo-600 px-6 py-2 shadow-md shadow-black/20"
                  >
                    Register as broker
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
