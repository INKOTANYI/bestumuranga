import { useState } from 'react'
import { login, register, me, logout } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function AuthTest() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const [output, setOutput] = useState('')
  const nav = useNavigate()

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-xl w-full p-8 text-center bg-white border rounded">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Auth Test</h1>
        <p className="mt-2 text-gray-600">Quickly test login/register/me/logout.</p>
        <div className="mt-6 grid gap-3 text-left">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          <div className="flex gap-2 justify-center mt-2">
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700" onClick={async () => {
              try {
                const res = await login(email, password)
                setOutput(JSON.stringify(res.user, null, 2))
                const role = res?.user?.role
                if (role === 'admin') nav('/admin', { replace: true })
                else if (role === 'broker') nav('/broker', { replace: true })
                else nav('/', { replace: true })
              } catch {
                setOutput('Login failed')
              }
            }}>Login</button>
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700" onClick={async () => {
              try { const res = await register({ email, password }); setOutput(JSON.stringify(res.user, null, 2)) } catch { setOutput('Register failed') }
            }}>Register</button>
            <button className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700" onClick={async () => {
              try { const res = await me(); setOutput(JSON.stringify(res.user, null, 2)) } catch { setOutput('Not authenticated') }
            }}>Me</button>
            <button className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-800" onClick={async () => {
              try { await logout(); setOutput('Logged out') } catch { setOutput('Logout failed') }
            }}>Logout</button>
          </div>
          <pre className="mt-4 bg-gray-50 border rounded p-3 text-left whitespace-pre-wrap break-words min-h-24">{output}</pre>
        </div>
      </div>
    </div>
  )
}
