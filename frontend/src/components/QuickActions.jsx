export default function QuickActions({ actions = [], className = '' }){
  // actions: [{ label, onClick, variant }]
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {actions.map((a, i) => (
        <button key={i} onClick={a.onClick}
          className={`${a.variant==='primary' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white/10 hover:bg-white/15 text-gray-100'} px-3 py-2 rounded`}
        >{a.label}</button>
      ))}
    </div>
  )
}
