import { Link } from 'react-router-dom'

export default function DashboardCards({ items = [], className = '', itemClassName = '' }) {
  const gridCls = className || 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3'
  const baseCard = 'relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white px-4 py-3 flex flex-col justify-center shadow-[0_10px_30px_rgba(15,23,42,0.6)] transition-all duration-200'
  const hoverCard = 'hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(129,140,248,0.6)] hover:brightness-110'
  const cardCls = itemClassName || `${baseCard} ${hoverCard}`
  return (
    <div className={gridCls}>
      {items.map((c, i) => {
        const clickable = Boolean(c.to || c.onClick)
        const Wrapper = c.to ? Link : (c.onClick ? 'button' : 'div')
        const props = c.to ? { to: c.to } : (c.onClick ? { onClick: c.onClick, type: 'button' } : {})
        const extra = clickable ? ' cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200/60 active:scale-95' : ''
        return (
          <Wrapper key={i} {...props} className={cardCls + extra}>
            <div className="text-[0.68rem] tracking-wide uppercase text-indigo-100/80 flex items-center justify-between">
              <span>{c.title}</span>
              {c.badge && <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[0.6rem]">{c.badge}</span>}
            </div>
            <div className="mt-1.5 text-3xl font-extrabold leading-none drop-shadow-sm">{c.value}</div>
            {c.subtitle && <div className="mt-1 text-xs text-indigo-50/85">{c.subtitle}</div>}
            {/* soft glow overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_0_0,rgba(248,250,252,0.24),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.35),transparent_55%)]" />
          </Wrapper>
        )
      })}
    </div>
  )
}
