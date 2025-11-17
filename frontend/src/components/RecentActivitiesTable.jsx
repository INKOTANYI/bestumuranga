export default function RecentActivitiesTable({ title = 'Recent Activity', rows = [], flat = false, className = '' }){
  const container = flat ? `p-3 ${className}` : `rounded-xl border border-white/10 bg-gray-900/60 p-4 ${className}`
  return (
    <div className={container}>
      <div className="font-semibold mb-3">{title}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-400">
            <tr>
              <th className="text-left py-2 pr-4">When</th>
              <th className="text-left py-2 pr-4">Title</th>
              <th className="text-left py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {(rows.length ? rows : [{when:'—', title:'No activity', status:'—'}]).map((r, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="py-2 pr-4 text-gray-300">{r.when}</td>
                <td className="py-2 pr-4">{r.title}</td>
                <td className="py-2 pr-4 text-gray-400">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
