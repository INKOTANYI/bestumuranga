import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { me } from '../lib/api'

export default function RequireRole({ roles = [], children }) {
  const nav = useNavigate()
  const [status, setStatus] = useState('checking') // checking | ok | redirect

  useEffect(() => {
    (async () => {
      try {
        const res = await me()
        const user = res?.user
        if (!user) {
          nav('/login', { replace: true })
          setStatus('redirect')
          return
        }
        const wantsAdmin = roles.includes('admin')
        // For the presentation: allow brokers on admin pages (no separate admin account)
        const roleAllowed = roles.length === 0 || roles.includes(user.role) || (wantsAdmin && user.role === 'broker')
        if (!roleAllowed) {
          // Redirect to the correct dashboard for this role
          if (user.role === 'admin') nav('/admin', { replace: true })
          else if (user.role === 'broker') nav('/broker', { replace: true })
          else nav('/', { replace: true })
          setStatus('redirect')
          return
        }
        setStatus('ok')
      } catch {
        nav('/login', { replace: true })
        setStatus('redirect')
      }
    })()
  }, [])

  if (status !== 'ok') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Checking access...</div>
    )
  }

  return children
}
