import { Link, useLocation } from 'react-router-dom'

function Item({ to, label }){
  const loc = useLocation()
  const active = loc.pathname === to || (to.includes('#') && (loc.pathname + loc.hash) === to)
  return (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${active ? 'bg-indigo-600/20 text-white' : 'text-gray-200 hover:bg-white/10'}`}>
      <span className="w-2 h-2 rounded-full bg-current"/>
      <span>{label}</span>
    </Link>
  )
}

export default function Sidebar({ items = [], footer = '' }){
  return (
    <aside className="w-60 hidden md:block border-r border-white/10 bg-gray-900/60 min-h-[calc(100vh-56px)] p-3">
      <nav className="grid gap-1">
        {items.map((it) => (
          <Item key={it.to} to={it.to} label={it.label} />
        ))}
      </nav>
      {footer && <div className="mt-6 text-xs text-gray-400 px-3">{footer}</div>}
    </aside>
  )
}
