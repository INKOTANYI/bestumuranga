import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminCategoryCounts, adminBrokersCounts, adminSupportInbox, adminProjectsList, adminPropertiesPending, adminBrokersList, adminApproveBroker, adminRejectBroker, adminUsersList } from '../lib/api'
import AdminShell from '../components/AdminShell'
import DashboardCards from '../components/DashboardCards'

export default function Admin() {
  const navigate = useNavigate()
  const [brokers, setBrokers] = useState({ total: 0, pending: 0 })
  const [cats, setCats] = useState({ houses: 0, apartments: 0, cars: 0 })
  const [support, setSupport] = useState({ open: 0, items: [] })
  const [projects, setProjects] = useState({ pending: 0, items: [] })
  const [properties, setProperties] = useState({ pending: 0, items: [] })
  const [brokersModal, setBrokersModal] = useState({ open: false, title: '', status: undefined, rows: [], page: 1, perPage: 10, lastPage: 1, total: 0, loading: false })
  const [usersModal, setUsersModal] = useState({ open: false, title: 'All Users', rows: [], page: 1, perPage: 10, lastPage: 1, total: 0, loading: false })

  async function load() {
    try {
      const [bc, cc, s, p, pr] = await Promise.all([
        adminBrokersCounts(),
        adminCategoryCounts(),
        adminSupportInbox(),
        adminProjectsList(),
        adminPropertiesPending(),
      ])
      setBrokers({ total: bc.total || 0, pending: bc.pending || 0 })
      setCats({ houses: cc.houses || 0, apartments: cc.apartments || 0, cars: cc.cars || 0 })
      setSupport({ open: s.open || 0, items: s.items || [] })
      setProjects({ pending: p.pending || 0, items: p.items || [] })
      setProperties({ pending: pr.pending || 0, items: pr.items || [] })
    } catch (e) {}
  }

  async function openUsersModal() {
    setUsersModal(m => ({ ...m, open: true, page: 1 }))
    await loadUsersPage({ page: 1 })
  }

  async function loadUsersPage({ page = usersModal.page } = {}) {
    setUsersModal(m => ({ ...m, loading: true }))
    try {
      const res = await adminUsersList({ page, perPage: usersModal.perPage })
      setUsersModal(m => ({
        ...m,
        rows: res.data || [],
        page: res.current_page || page,
        perPage: res.per_page || m.perPage,
        lastPage: res.last_page || 1,
        total: res.total || (res.data||[]).length,
        loading: false,
      }))
    } catch {
      setUsersModal(m => ({ ...m, loading: false }))
    }
  }
  useEffect(() => { load() }, [])

  async function openBrokersModal({ status, title }) {
    setBrokersModal(m => ({ ...m, open: true, title, status, page: 1 }))
    await loadBrokersPage({ status, page: 1 })
  }

  async function loadBrokersPage({ status = brokersModal.status, page = brokersModal.page }) {
    setBrokersModal(m => ({ ...m, loading: true }))
    try {
      const res = await adminBrokersList({ status, page, perPage: brokersModal.perPage })
      setBrokersModal(m => ({
        ...m,
        rows: res.data || [],
        page: res.current_page || page,
        perPage: res.per_page || m.perPage,
        lastPage: res.last_page || 1,
        total: res.total || (res.data||[]).length,
        loading: false,
      }))
    } catch {
      setBrokersModal(m => ({ ...m, loading: false }))
    }
  }

  useEffect(() => { load() }, [])

  return (
    <AdminShell title="Admin Dashboard" role="admin">
      <DashboardCards
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-0"
        itemClassName="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
        items={[
          { title: 'Create Listing', value: 'New', onClick: ()=> navigate('/admin/listings/create') },
          { title: 'All Users', value: 'View', onClick: ()=> openUsersModal() },
          { title: 'Total Brokers', value: String(brokers.total), onClick: ()=> openBrokersModal({ title: 'All Brokers', status: undefined }) },
          { title: 'Pending Brokers', value: String(brokers.pending), onClick: ()=> openBrokersModal({ title: 'Pending Brokers', status: 'pending' }) },
          { title: 'Approved Brokers', value: String(Math.max(0, (brokers.total||0) - (brokers.pending||0))), onClick: ()=> openBrokersModal({ title: 'Approved Brokers', status: 'approved' }) },
          { title: 'Houses', value: String(cats.houses) },
          { title: 'Apartments', value: String(cats.apartments) },
          { title: 'Cars', value: String(cats.cars) },
        ]}
      />

      {/* Brokers modal */}
      {brokersModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=> setBrokersModal(m=>({ ...m, open:false }))} />
          <div className="relative w-full max-w-3xl mx-3 rounded-lg border border-white/10 bg-gray-950/95 backdrop-blur p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-100">{brokersModal.title}</h3>
              <button className="text-gray-300 hover:text-white" onClick={()=> setBrokersModal(m=>({ ...m, open:false }))}>×</button>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-gray-300">
                  <tr>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Phone</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {brokersModal.loading && (
                    <tr><td className="py-4 px-2 text-gray-400" colSpan={4}>Loading…</td></tr>
                  )}
                  {!brokersModal.loading && (brokersModal.rows||[]).map(r => (
                    <tr key={r.id} className="border-t border-white/10">
                      <td className="py-2 px-2">{r.name}</td>
                      <td className="py-2 px-2">{r.phone || '—'}</td>
                      <td className="py-2 px-2">{r.email}</td>
                      <td className="py-2 px-2">{r.status || '—'}</td>
                    </tr>
                  ))}
                  {!brokersModal.loading && (!brokersModal.rows || brokersModal.rows.length===0) && (
                    <tr><td className="py-4 px-2 text-gray-400" colSpan={4}>No brokers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-1 py-2 text-sm">
              <div className="text-gray-400">{brokersModal.total>0 ? `Showing ${(brokersModal.page-1)*brokersModal.perPage+1}-${Math.min(brokersModal.page*brokersModal.perPage, brokersModal.total)} of ${brokersModal.total}` : 'No results'}</div>
              <div className="flex gap-2">
                <button className={`px-3 py-1 rounded ${brokersModal.page<=1||brokersModal.loading?'bg-white/5 text-gray-500':'bg-white/10 hover:bg-white/15 text-gray-100'}`} disabled={brokersModal.page<=1||brokersModal.loading} onClick={()=> loadBrokersPage({ page: Math.max(1, brokersModal.page-1) })}>Prev</button>
                <button className={`px-3 py-1 rounded ${brokersModal.page>=brokersModal.lastPage||brokersModal.loading?'bg-white/5 text-gray-500':'bg-white/10 hover:bg-white/15 text-gray-100'}`} disabled={brokersModal.page>=brokersModal.lastPage||brokersModal.loading} onClick={()=> loadBrokersPage({ page: Math.min(brokersModal.lastPage, brokersModal.page+1) })}>Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent properties table (kept minimal like Option B) */}
      <div className="grid gap-3 md:grid-cols-1 p-3">
        <div className="rounded-2xl bg-gradient-to-b from-gray-900/80 to-gray-950/60 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-200">Recent Properties</h4>
            <button className="text-xs text-gray-300 hover:text-white">Manage</button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="text-left py-2 px-2">Title</th>
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {(properties.items||[]).slice(0,5).map(it => (
                  <tr key={it.id} className="border-t border-white/10">
                    <td className="py-2 px-2">{it.title}</td>
                    <td className="py-2 px-2">—</td>
                    <td className="py-2 px-2">—</td>
                    <td className="py-2 px-2">Submitted for approval</td>
                    <td className="py-2 px-2">—</td>
                  </tr>
                ))}
                {(!properties.items || properties.items.length === 0) && (
                  <tr><td className="py-6 px-2 text-gray-400" colSpan={5}>No properties</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
