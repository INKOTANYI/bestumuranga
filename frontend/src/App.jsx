import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import Home from './pages/Home'
import Detail from './pages/Detail'
import Broker from './pages/Broker'
import Admin from './pages/Admin'
import AdminCreateListing from './pages/AdminCreateListing'
import AuthTest from './pages/AuthTest'
import BrokerRegister from './pages/BrokerRegister'
import Login from './pages/Login'
import RequireRole from './components/RequireRole'
// Header removed from global layout to keep dashboards clean

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/listing/:id" element={<Detail/>} />
          <Route path="/broker" element={<RequireRole roles={['broker']}><Broker/></RequireRole>} />
          <Route path="/register-broker" element={<BrokerRegister/>} />
          <Route path="/admin" element={<RequireRole roles={['admin']}><Admin/></RequireRole>} />
          <Route path="/admin/listings/create" element={<RequireRole roles={['admin']}><AdminCreateListing/></RequireRole>} />
          <Route path="/auth-test" element={<AuthTest/>} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </main>
      <Toaster richColors theme="dark" position="top-right" />
    </div>
  )
}
