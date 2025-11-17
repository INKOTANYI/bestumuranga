import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { me, logout } from '../lib/api'
import { LayoutDashboard, ListOrdered, Inbox, BriefcaseBusiness, Building2, ClipboardList, HelpCircle, Home, LogOut, MessageCircle, Languages, Linkedin, Twitter, Facebook } from 'lucide-react'

function NavItem({ to = '#', Icon = LayoutDashboard, label, active }){
  return (
    <Link to={to} className={`group relative flex items-center gap-3 h-10 px-3 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${active ? 'bg-white/5 text-white font-medium' : 'text-gray-300 hover:bg-white/5'}`}>
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-indigo-500" />}
      <Icon className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
      <span>{label}</span>
    </Link>
  )
}

export default function AdminShell({ title = '', children, role = 'admin' }){
  const loc = useLocation()
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    (async () => {
      try { const res = await me(); setUser(res.user) } catch {}
    })()
  }, [])

  const isAdmin = role === 'admin'
  const menu = isAdmin ? [
    { to: '/admin', key: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/admin#engineers', key: '/admin#engineers', label: 'Engineers', Icon: BriefcaseBusiness },
    { to: '/admin#projects', key: '/admin#projects', label: 'Projects', Icon: ClipboardList },
    { to: '/admin#properties', key: '/admin#properties', label: 'Properties', Icon: Building2 },
    { to: '/admin#applications', key: '/admin#applications', label: 'Applications', Icon: Inbox },
    { to: '/admin#support', key: '/admin#support', label: 'Support', Icon: HelpCircle },
  ] : [
    { to: '/broker', key: '/broker', label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/broker#listings', key: '/broker#listings', label: 'Listings', Icon: ListOrdered },
    { to: '/broker#inquiries', key: '/broker#inquiries', label: 'Inquiries', Icon: Inbox },
    { to: '/broker#support', key: '/broker#support', label: 'Support', Icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
      {/* Global Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-amber-400/40 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-700 backdrop-blur flex items-center justify-between px-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white/90 shadow"/>
          <div className="font-semibold tracking-wide">{isAdmin ? 'Admin' : 'Broker'}</div>
          <span className="ml-2 hidden md:inline text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase tracking-wider">Users</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-600/90 hover:bg-indigo-700 text-white shadow-sm">
            <MessageCircle className="w-4 h-4"/> Live Chat
          </button>
          <div className="hidden sm:flex items-center gap-2 text-gray-300">
            <Linkedin className="w-4 h-4 hover:text-white transition-colors"/>
            <Twitter className="w-4 h-4 hover:text-white transition-colors"/>
            <Facebook className="w-4 h-4 hover:text-white transition-colors"/>
          </div>
          <button onClick={()=>nav('/')} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-gray-100">
            <Home className="w-4 h-4"/> User
          </button>
          <button onClick={async()=>{ try{ await logout(); nav('/login', { replace:true }) }catch{} }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-100 border border-white/10">
            <LogOut className="w-4 h-4"/> Logout
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar (sticky under header) */}
        <aside className="w-72 hidden md:block border-r border-white/10 bg-gradient-to-b from-indigo-900 via-slate-900 to-amber-900/80 p-4 sticky top-14 h-[calc(100vh-56px)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] tracking-wider uppercase text-indigo-100/80 px-1">{isAdmin ? 'Admin area' : 'Broker area'}</div>
              <div className="mt-1 text-xs text-indigo-100/80 px-1">Signed in as <span className="font-semibold text-white">{user?.role || '—'}</span></div>
            </div>
            {/* Language selector */}
            <div className="text-[10px] text-amber-50 flex flex-col items-end">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/20 border border-white/10">
                <Languages className="w-3 h-3" />
                <select
                  className="bg-transparent text-[10px] focus:outline-none cursor-pointer"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="sw">Swahili</option>
                  <option value="rw">Kinyarwanda</option>
                </select>
              </div>
            </div>
          </div>

          <nav className="grid gap-1 mt-2">
            {menu.map(m => (
              <NavItem key={m.key} to={m.to} Icon={m.Icon} label={m.label} active={loc.pathname + loc.hash === m.key || loc.pathname === m.key} />
            ))}
          </nav>

          {!isAdmin && (
            <div className="mt-5 space-y-3 text-xs">
              <div className="text-[10px] tracking-wider uppercase text-amber-100 px-1 mb-1">Quick actions</div>
              <button
                type="button"
                onClick={() => nav('/broker?new=1')}
                className="w-full flex items-center justify-between rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-3 text-xs font-semibold shadow-md transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Post new ad
                </span>
                <span className="text-[9px] uppercase">Premium</span>
              </button>

              <button
                type="button"
                onClick={() => nav('/broker#listings')}
                className="w-full flex items-center justify-between rounded-xl bg-slate-900/70 hover:bg-slate-800/80 text-gray-100 px-3 py-3 text-xs font-semibold border border-white/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" />
                  All my ads
                </span>
                <span className="text-[9px] text-amber-200">View</span>
              </button>

              <button
                type="button"
                onClick={() => nav('/broker#support')}
                className="w-full flex items-center justify-between rounded-xl bg-indigo-900/70 hover:bg-indigo-800/80 text-indigo-50 px-3 py-3 text-xs font-semibold border border-indigo-500/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Inbox className="w-4 h-4" />
                  Inbox / Inquiries
                </span>
                <span className="text-[9px] text-indigo-200">New</span>
              </button>
            </div>
          )}
        </aside>

        {/* Main (full-width, no gap) */}
        <main className="flex-1">
          {title && (
            <h1 className="text-lg font-semibold text-center py-3 text-gray-100/80">
              {title}
            </h1>
          )}
          {children}
        </main>
      </div>

      {/* Sticky Footer */}
      <footer className="mt-auto border-t border-amber-400/30 bg-gradient-to-r from-indigo-900 via-slate-900 to-amber-800 text-gray-200 px-6 py-4 flex items-center justify-center">
        <span className="text-sm md:text-base font-semibold text-amber-100">
          © 2025 Bestumuranga.com
        </span>
      </footer>
    </div>
  )
}
