import { useNavigate } from 'react-router-dom'
import { logout } from '../lib/api'

export default function TopBar({ title = '' }){
  const nav = useNavigate()
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <button onClick={()=>nav('/')} className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/15 text-gray-100">User dashboard</button>
        <button onClick={async()=>{ try{ await logout(); nav('/login',{replace:true}) }catch{} }} className="px-3 py-1.5 text-sm rounded bg-indigo-600 hover:bg-indigo-700 text-white">Logout</button>
      </div>
    </div>
  )
}
