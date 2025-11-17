import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export default function Header() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)

  function changeLanguage(e) {
    const value = e.target.value
    if (value) i18n.changeLanguage(value)
  }
  return (
    <header className="w-full sticky top-0 z-40 text-white">
      {/* Top contact bar */}
      <div className="w-full bg-gradient-to-r from-sky-950 via-sky-900 to-sky-800 border-b border-sky-950/60">
        <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-6 h-8 flex items-center justify-between text-[11px] md:text-[12px]">
          <div className="flex items-center gap-4 text-sky-100/80">
            <span>📧 support@bestumuranga.com</span>
            <span className="hidden sm:inline">📞 +250 783 163 187</span>
          </div>
          <div className="flex items-center gap-3 text-sky-100/80">
            <a href="#" className="hover:text-white font-semibold">Fb</a>
            <a href="#" className="hover:text-white font-semibold">Ig</a>
            <a href="#" className="hover:text-white font-semibold">Wa</a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
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
            <Link
              to="/#promoted-ads"
              className="text-sky-100/80 hover:text-white"
            >
              View listings
            </Link>
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

          {/* Right side: phone + CTA */}
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
              <span className="uppercase text-sky-100/80 tracking-wide">Call us</span>
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
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-white via-slate-50 to-sky-50 shadow-2xl px-6 py-7 transform transition-all duration-200 ease-out scale-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  <span className="text-[11px] font-medium text-sky-800">BestUmuranga</span>
                </div>
                <h2 className="text-base md:text-lg font-semibold text-slate-900 leading-snug">
                  Post a free listing
                </h2>
                <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed">
                  Choose how you want to continue. Login if you already have an account or register as a broker to start posting free ads.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="shrink-0 ml-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 w-7 h-7 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setShowAuthModal(false); navigate('/login') }}
                className="w-full rounded-2xl border border-sky-200 bg-white/80 px-3.5 py-3.5 text-xs md:text-sm font-semibold text-sky-800 hover:bg-sky-50 hover:border-sky-300 flex flex-col items-start gap-1 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">IN</span>
                  <span>Login</span>
                </span>
                <span className="text-[11px] font-normal text-sky-700 mt-1">I already have an account</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowAuthModal(false); navigate('/register-broker') }}
                className="w-full rounded-2xl border border-amber-300 bg-amber-50 px-3.5 py-3.5 text-xs md:text-sm font-semibold text-amber-900 hover:bg-amber-100 flex flex-col items-start gap-1 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">RG</span>
                  <span>Register broker</span>
                </span>
                <span className="text-[11px] font-normal text-amber-800 mt-1">Create a free broker account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp support floating button */}
      <a
        href="https://wa.me/250783163187"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 shadow-lg shadow-emerald-500/40 text-xs md:text-sm font-semibold"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="h-4 w-4 fill-current"
          >
            <path d="M16 3C9.383 3 4 8.383 4 15c0 2.164.586 4.176 1.609 5.922L4 29l8.266-1.57A11.87 11.87 0 0 0 16 27c6.617 0 12-5.383 12-12S22.617 3 16 3zm0 2c5.535 0 10 4.465 10 10s-4.465 10-10 10a9.84 9.84 0 0 1-3.316-.566l-.238-.082-4.777.91.918-4.66-.156-.242A9.77 9.77 0 0 1 6 15c0-5.535 4.465-10 10-10zm-4.105 5a1.1 1.1 0 0 0-1.012.68c-.262.629-.77 1.902-.77 2.656 0 .77.395 1.492.887 2.07l.074.089c.883 1.252 2.488 2.676 4.551 3.535 2.238.926 3.191 1.051 3.75 1.051.758 0 1.512-.473 1.863-.957.262-.356.602-.973.688-1.406.074-.375-.105-.742-.457-.902l-2.211-.984a.86.86 0 0 0-1 .242l-.562.719c-.125.16-.352.203-.531.117-.277-.133-1.109-.516-1.773-1.148-.637-.605-1.074-1.355-1.199-1.574-.09-.156-.098-.348-.023-.512l.484-1.004a.78.78 0 0 0-.086-.805l-.043-.055c-.215-.266-1.008-1.23-1.348-1.574A1.13 1.13 0 0 0 11.895 10z" />
          </svg>
        </span>
        <span className="hidden sm:inline">WhatsApp support</span>
      </a>
    </header>
  )
}
