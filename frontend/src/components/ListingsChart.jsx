// Placeholder chart component (no external deps). Replace with Recharts later if approved.
export default function ListingsChart({ title = 'Listings (Last 7 days)', data = [3,5,2,6,4,7,5], flat = false, className = '' }){
  const max = Math.max(1, ...data)
  const container = flat ? `p-3 ${className}` : `rounded-xl border border-white/10 bg-gray-900/60 p-4 ${className}`
  const barCls = flat ? 'flex-1 bg-indigo-600' : 'flex-1 bg-indigo-600/60 rounded-t'
  return (
    <div className={container}>
      <div className="font-semibold mb-3">{title}</div>
      <div className="h-32 flex items-end gap-2">
        {data.map((v,i)=>{
          const h = Math.round((v/max)*100)
          return (
            <div key={i} className={barCls} style={{height: h+'%'}} title={`${v}`}></div>
          )
        })}
      </div>
      {!flat && <div className="mt-2 text-xs text-gray-400">Simple bar preview (upgrade to Recharts for tooltips/axes)</div>}
    </div>
  )
}
