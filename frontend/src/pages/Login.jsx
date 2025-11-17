import { useState } from 'react'
import { login, me } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState({})

  function validEmail(v){ return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v) }
  const fieldErrors = {
    email: !email ? 'Email is required' : (!validEmail(email) ? 'Enter a valid email' : ''),
    password: !password ? 'Password is required' : ''
  }
  const isValid = Object.values(fieldErrors).every(v => v === '')

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (!isValid) { setTouched({email:true,password:true}); setLoading(false); return }
      await login(email, password)
      const fresh = await me()
      const role = fresh?.user?.role
      if (role === 'admin') nav('/admin', { replace: true })
      else if (role === 'broker') nav('/broker', { replace: true })
      else nav('/', { replace: true })
    } catch (e) {
      setError(e?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-tr from-purple-300/60 via-white to-purple-200/60">
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden border">
        {/* Left panel */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="relative h-full w-full p-8 bg-black/40 text-white flex flex-col justify-end">
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="mt-3 text-sm text-gray-100 max-w-sm">Sign in to manage listings and access your dashboard. New here?
              <button type="button" onClick={()=>nav('/register-broker')} className="ml-1 underline hover:text-white">Create an account</button>
            </p>
          </div>
        </div>
        {/* Right form */}
        <div className="p-8">
          <h3 className="text-2xl font-semibold">Login</h3>
          <p className="text-gray-600 text-sm mt-1 mb-6">Enter your credentials to continue.</p>
          <form onSubmit={submit} className="grid gap-4">
            <div>
              <input className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.email && fieldErrors.email ? 'border-rose-500' : 'border-gray-300'}`} placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} onBlur={()=>setTouched(t=>({...t,email:true}))} required />
              {touched.email && fieldErrors.email && <div className="text-rose-600 text-xs mt-1">{fieldErrors.email}</div>}
            </div>
            <div>
              <input className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${touched.password && fieldErrors.password ? 'border-rose-500' : 'border-gray-300'}`} placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} onBlur={()=>setTouched(t=>({...t,password:true}))} required />
              {touched.password && fieldErrors.password && <div className="text-rose-600 text-xs mt-1">{fieldErrors.password}</div>}
            </div>
            <button disabled={loading || !isValid} className="rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Signing in...' : 'Login'}</button>
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
