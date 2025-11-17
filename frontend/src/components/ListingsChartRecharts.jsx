import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

export default function ListingsChartRecharts({ title = 'Listings (Last 7 days)', data = [3,5,2,6,4,7,5] }){
  const chartData = data.map((v, i) => ({ day: `D${i+1}`, value: v }))
  return (
    <div className="p-3">
      <div className="font-semibold mb-3">{title}</div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} allowDecimals={false} />
            <Tooltip contentStyle={{ background:'#0b1020', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#e5e7eb' }} cursor={{ fill: 'rgba(79,70,229,0.1)' }} />
            <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
