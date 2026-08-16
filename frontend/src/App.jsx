import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiFetch, getGatewayUrl } from './api'
import { hasRole, initAuth, login, logout } from './auth'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const today = new Date().toISOString().slice(0, 10)

const initialUser = { name: '', email: '', bloodGroup: 'O+', phone: '', city: '', role: 'DONOR' }
const initialDonation = { donorId: '', bloodGroup: 'O+', quantityMl: 450, location: '', availableDate: today }
const initialBank = { name: '', address: '', city: '', phone: '' }
const initialStock = { bloodBankId: '', bloodGroup: 'O+', quantityUnits: 1 }
const initialRequest = { bloodBankId: '', bloodGroup: 'O+', quantityUnits: 1, requestedDate: today }

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>
}

function Empty({ text }) {
  return <div className="empty-state">{text}</div>
}

function Status({ value }) {
  return <span className={`status status-${String(value || '').toLowerCase()}`}>{value}</span>
}

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab] = useState('dashboard')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [users, setUsers] = useState([])
  const [donations, setDonations] = useState([])
  const [banks, setBanks] = useState([])
  const [stocks, setStocks] = useState([])
  const [requests, setRequests] = useState([])

  const [userForm, setUserForm] = useState(initialUser)
  const [donationForm, setDonationForm] = useState(initialDonation)
  const [bankForm, setBankForm] = useState(initialBank)
  const [stockForm, setStockForm] = useState(initialStock)
  const [requestForm, setRequestForm] = useState(initialRequest)

  const canManageDonations = hasRole(session, 'DONOR') || hasRole(session, 'ADMIN')
  const canManageBanks = hasRole(session, 'BLOOD_BANK') || hasRole(session, 'ADMIN')
  const isAdmin = hasRole(session, 'ADMIN')

  useEffect(() => {
    initAuth()
      .then(setSession)
      .catch((authError) => setError(authError.message))
      .finally(() => setAuthLoading(false))
  }, [])

  useEffect(() => {
    if (!session) return
    loadAll()
    // Pre-fill a profile when a demo account signs in.
    setUserForm((current) => ({
      ...current,
      name: session.name || current.name,
      email: session.email || current.email,
      role: hasRole(session, 'BLOOD_BANK') ? 'BLOOD_BANK' : hasRole(session, 'ADMIN') ? 'ADMIN' : 'DONOR',
    }))
  }, [session])

  useEffect(() => {
    if (!session?.email || !users.length) return
    const profile = users.find((user) => user.email?.toLowerCase() === session.email.toLowerCase())
    if (profile) {
      setDonationForm((current) => ({ ...current, donorId: current.donorId || profile.id }))
    }
  }, [users, session])

  async function withAction(action, successMessage) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
      if (successMessage) setMessage(successMessage)
      await loadAll(false)
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setBusy(false)
    }
  }

  async function loadAll(showSpinner = true) {
    if (showSpinner) setBusy(true)
    setError('')
    try {
      const results = await Promise.all([
        apiFetch('/api/users'),
        apiFetch('/api/donations'),
        apiFetch('/api/bloodbanks'),
        apiFetch('/api/bloodstocks'),
        apiFetch('/api/bloodrequests'),
      ])
      setUsers(results[0] || [])
      setDonations(results[1] || [])
      setBanks(results[2] || [])
      setStocks(results[3] || [])
      setRequests(results[4] || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      if (showSpinner) setBusy(false)
    }
  }

  const stats = useMemo(() => ({
    donors: users.filter((user) => user.role === 'DONOR').length,
    availableDonations: donations.filter((donation) => donation.status === 'AVAILABLE').length,
    stockUnits: stocks.reduce((sum, stock) => sum + Number(stock.quantityUnits || 0), 0),
    pendingRequests: requests.filter((request) => request.status === 'PENDING').length,
  }), [users, donations, stocks, requests])

  if (authLoading) {
    return <main className="center-screen"><div className="loading-card"><div className="spinner" />Checking login...</div></main>
  }

  if (!session) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <div className="brand-mark">+</div>
          <p className="eyebrow">Blood Donation Management System</p>
          <h1>Secure access for donors and blood banks</h1>
          <p className="muted">Sign in through Keycloak. The frontend will send your OAuth2 access token to the API Gateway for protected requests.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="primary-btn wide" type="button" onClick={login}>Sign in with Keycloak</button>
          <div className="demo-box">
            <strong>Demo accounts</strong>
            <span>Donor: <code>donor1 / donor123</code></span>
            <span>Blood bank: <code>bank1 / bank123</code></span>
            <span>Admin: <code>admin1 / admin123</code></span>
          </div>
          <small>Keycloak: http://localhost:8180 · Gateway: {getGatewayUrl()}</small>
        </section>
      </main>
    )
  }

  const navItems = [
    ['dashboard', 'Dashboard'],
    ['users', 'Users'],
    ['donations', 'Donations'],
    ['banks', 'Blood Banks'],
    ['stocks', 'Blood Stock'],
    ['requests', 'Blood Requests'],
  ]

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-row">
          <div className="brand-mark small">+</div>
          <div><p className="eyebrow">Blood Donation System</p><h1>LifeLine Network</h1></div>
        </div>
        <div className="user-area">
          <div className="user-copy"><strong>{session.name}</strong><span>{session.roles.filter((r) => ['DONOR', 'BLOOD_BANK', 'ADMIN'].includes(r)).join(' · ') || 'Authenticated user'}</span></div>
          <button className="secondary-btn" type="button" onClick={() => loadAll()}>Refresh</button>
          <button className="danger-btn" type="button" onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="nav-tabs">
        {navItems.map(([key, label]) => (
          <button key={key} type="button" className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
        ))}
      </nav>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {busy && <div className="progress"><span /></div>}

      {tab === 'dashboard' && (
        <section className="content-stack">
          <div className="hero-panel">
            <div>
              <span className="badge">OAuth2 + API Gateway + Microservices</span>
              <h2>Live data from the Blood Donation Management System</h2>
              <p>These figures are calculated from real API responses instead of hard-coded dashboard values.</p>
            </div>
            <div className="metric-grid">
              <div className="metric-card"><strong>{stats.donors}</strong><span>Registered donors</span></div>
              <div className="metric-card"><strong>{stats.availableDonations}</strong><span>Available donations</span></div>
              <div className="metric-card"><strong>{stats.stockUnits}</strong><span>Blood stock units</span></div>
              <div className="metric-card"><strong>{stats.pendingRequests}</strong><span>Pending requests</span></div>
            </div>
          </div>
          <div className="info-grid">
            <article className="panel"><h3>Security flow</h3><p>Client → OAuth2 bearer token → API Gateway → service-specific X-API-KEY → microservice.</p></article>
            <article className="panel"><h3>Current access</h3><p>{canManageDonations ? 'Donation management enabled. ' : ''}{canManageBanks ? 'Blood-bank management enabled. ' : ''}{isAdmin ? 'Administrator access enabled.' : ''}</p></article>
            <article className="panel"><h3>Rate limiting</h3><p>Redis-backed limit: 20 business API requests per 10-second window for each client IP.</p></article>
          </div>
        </section>
      )}

      {tab === 'users' && (
        <section className="workspace-grid">
          <form className="panel form-panel" onSubmit={(e) => {
            e.preventDefault()
            withAction(async () => {
              await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(userForm) })
              setUserForm(initialUser)
            }, 'User profile created.')
          }}>
            <h2>Create user profile</h2>
            <Field label="Full name"><input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></Field>
            <Field label="Email"><input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></Field>
            <Field label="Blood group"><select value={userForm.bloodGroup} onChange={(e) => setUserForm({ ...userForm, bloodGroup: e.target.value })}>{bloodGroups.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Phone"><input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} /></Field>
            <Field label="City"><input value={userForm.city} onChange={(e) => setUserForm({ ...userForm, city: e.target.value })} /></Field>
            <Field label="Role"><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option>DONOR</option><option>BLOOD_BANK</option>{isAdmin && <option>ADMIN</option>}</select></Field>
            <button className="primary-btn" disabled={busy}>Create profile</button>
          </form>
          <div className="panel list-panel"><h2>Users <span>{users.length}</span></h2>{users.length === 0 ? <Empty text="No user profiles yet." /> : <div className="table-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>Blood</th><th>City</th><th>Role</th><th /></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.id}</td><td><strong>{user.name}</strong><small>{user.email}</small></td><td>{user.bloodGroup}</td><td>{user.city || '—'}</td><td>{user.role}</td><td>{isAdmin && <button className="text-danger" type="button" onClick={() => withAction(() => apiFetch(`/api/users/${user.id}`, { method: 'DELETE' }), 'User deleted.')}>Delete</button>}</td></tr>)}</tbody></table></div>}</div>
        </section>
      )}

      {tab === 'donations' && (
        <section className="workspace-grid">
          <form className="panel form-panel" onSubmit={(e) => {
            e.preventDefault()
            withAction(async () => {
              await apiFetch('/api/donations', { method: 'POST', body: JSON.stringify({ ...donationForm, donorId: Number(donationForm.donorId), quantityMl: Number(donationForm.quantityMl) }) })
              setDonationForm({ ...initialDonation, donorId: donationForm.donorId })
            }, 'Donation created.')
          }}>
            <h2>Create donation</h2>
            {!canManageDonations && <div className="permission-note">Your Keycloak role can view donations but cannot create or change them.</div>}
            <Field label="Donor ID"><input required type="number" min="1" value={donationForm.donorId} onChange={(e) => setDonationForm({ ...donationForm, donorId: e.target.value })} /></Field>
            <Field label="Blood group"><select value={donationForm.bloodGroup} onChange={(e) => setDonationForm({ ...donationForm, bloodGroup: e.target.value })}>{bloodGroups.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Quantity (ml)"><input required type="number" min="1" value={donationForm.quantityMl} onChange={(e) => setDonationForm({ ...donationForm, quantityMl: e.target.value })} /></Field>
            <Field label="Location"><input required value={donationForm.location} onChange={(e) => setDonationForm({ ...donationForm, location: e.target.value })} /></Field>
            <Field label="Available date"><input required type="date" min={today} value={donationForm.availableDate} onChange={(e) => setDonationForm({ ...donationForm, availableDate: e.target.value })} /></Field>
            <button className="primary-btn" disabled={busy || !canManageDonations}>Create donation</button>
          </form>
          <div className="panel list-panel"><h2>Donations <span>{donations.length}</span></h2>{donations.length === 0 ? <Empty text="No donation records yet." /> : <div className="card-list">{donations.map((donation) => <article className="record-card" key={donation.id}><div><div className="record-title"><strong>{donation.bloodGroup}</strong><Status value={donation.status} /></div><p>{donation.quantityMl} ml · {donation.location} · {donation.availableDate}</p><small>Donation #{donation.id} · Donor #{donation.donorId}</small></div>{canManageDonations && <div className="record-actions"><select value={donation.status} onChange={(e) => withAction(() => apiFetch(`/api/donations/${donation.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) }), 'Donation status updated.')}><option>AVAILABLE</option><option>RESERVED</option><option>COMPLETED</option><option>CANCELLED</option></select><button className="text-danger" type="button" onClick={() => withAction(() => apiFetch(`/api/donations/${donation.id}`, { method: 'DELETE' }), 'Donation deleted.')}>Delete</button></div>}</article>)}</div>}</div>
        </section>
      )}

      {tab === 'banks' && (
        <section className="workspace-grid">
          <form className="panel form-panel" onSubmit={(e) => {
            e.preventDefault()
            withAction(async () => {
              await apiFetch('/api/bloodbanks', { method: 'POST', body: JSON.stringify(bankForm) })
              setBankForm(initialBank)
            }, 'Blood bank created.')
          }}>
            <h2>Create blood bank</h2>
            {!canManageBanks && <div className="permission-note">Only BLOOD_BANK and ADMIN roles can manage blood banks.</div>}
            <Field label="Name"><input required value={bankForm.name} onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })} /></Field>
            <Field label="Address"><input required value={bankForm.address} onChange={(e) => setBankForm({ ...bankForm, address: e.target.value })} /></Field>
            <Field label="City"><input required value={bankForm.city} onChange={(e) => setBankForm({ ...bankForm, city: e.target.value })} /></Field>
            <Field label="Phone"><input required value={bankForm.phone} onChange={(e) => setBankForm({ ...bankForm, phone: e.target.value })} /></Field>
            <button className="primary-btn" disabled={busy || !canManageBanks}>Create blood bank</button>
          </form>
          <div className="panel list-panel"><h2>Blood banks <span>{banks.length}</span></h2>{banks.length === 0 ? <Empty text="No blood banks yet." /> : <div className="card-list">{banks.map((bank) => <article className="record-card" key={bank.id}><div><div className="record-title"><strong>{bank.name}</strong><span className="id-chip">#{bank.id}</span></div><p>{bank.address}, {bank.city}</p><small>{bank.phone}</small></div>{canManageBanks && <button className="text-danger" type="button" onClick={() => withAction(() => apiFetch(`/api/bloodbanks/${bank.id}`, { method: 'DELETE' }), 'Blood bank deleted.')}>Delete</button>}</article>)}</div>}</div>
        </section>
      )}

      {tab === 'stocks' && (
        <section className="workspace-grid">
          <form className="panel form-panel" onSubmit={(e) => {
            e.preventDefault()
            withAction(async () => {
              await apiFetch('/api/bloodstocks', { method: 'POST', body: JSON.stringify({ ...stockForm, bloodBankId: Number(stockForm.bloodBankId), quantityUnits: Number(stockForm.quantityUnits) }) })
              setStockForm(initialStock)
            }, 'Blood stock created.')
          }}>
            <h2>Add blood stock</h2>
            {!canManageBanks && <div className="permission-note">Only BLOOD_BANK and ADMIN roles can manage stock.</div>}
            <Field label="Blood bank"><select required value={stockForm.bloodBankId} onChange={(e) => setStockForm({ ...stockForm, bloodBankId: e.target.value })}><option value="">Select bank</option>{banks.map((bank) => <option key={bank.id} value={bank.id}>#{bank.id} {bank.name}</option>)}</select></Field>
            <Field label="Blood group"><select value={stockForm.bloodGroup} onChange={(e) => setStockForm({ ...stockForm, bloodGroup: e.target.value })}>{bloodGroups.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Quantity units"><input required type="number" min="0" value={stockForm.quantityUnits} onChange={(e) => setStockForm({ ...stockForm, quantityUnits: e.target.value })} /></Field>
            <button className="primary-btn" disabled={busy || !canManageBanks || !banks.length}>Add stock</button>
          </form>
          <div className="panel list-panel"><h2>Blood stock <span>{stocks.length}</span></h2>{stocks.length === 0 ? <Empty text="No stock records yet." /> : <div className="table-wrap"><table><thead><tr><th>ID</th><th>Bank</th><th>Blood group</th><th>Units</th><th /></tr></thead><tbody>{stocks.map((stock) => <tr key={stock.id}><td>{stock.id}</td><td>#{stock.bloodBankId}</td><td><strong>{stock.bloodGroup}</strong></td><td>{stock.quantityUnits}</td><td>{canManageBanks && <button className="text-danger" type="button" onClick={() => withAction(() => apiFetch(`/api/bloodstocks/${stock.id}`, { method: 'DELETE' }), 'Blood stock deleted.')}>Delete</button>}</td></tr>)}</tbody></table></div>}</div>
        </section>
      )}

      {tab === 'requests' && (
        <section className="workspace-grid">
          <form className="panel form-panel" onSubmit={(e) => {
            e.preventDefault()
            withAction(async () => {
              await apiFetch('/api/bloodrequests', { method: 'POST', body: JSON.stringify({ ...requestForm, bloodBankId: Number(requestForm.bloodBankId), quantityUnits: Number(requestForm.quantityUnits) }) })
              setRequestForm(initialRequest)
            }, 'Blood request created.')
          }}>
            <h2>Create blood request</h2>
            {!canManageBanks && <div className="permission-note">Only BLOOD_BANK and ADMIN roles can manage requests.</div>}
            <Field label="Blood bank"><select required value={requestForm.bloodBankId} onChange={(e) => setRequestForm({ ...requestForm, bloodBankId: e.target.value })}><option value="">Select bank</option>{banks.map((bank) => <option key={bank.id} value={bank.id}>#{bank.id} {bank.name}</option>)}</select></Field>
            <Field label="Blood group"><select value={requestForm.bloodGroup} onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}>{bloodGroups.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Quantity units"><input required type="number" min="1" value={requestForm.quantityUnits} onChange={(e) => setRequestForm({ ...requestForm, quantityUnits: e.target.value })} /></Field>
            <Field label="Requested date"><input required type="date" value={requestForm.requestedDate} onChange={(e) => setRequestForm({ ...requestForm, requestedDate: e.target.value })} /></Field>
            <button className="primary-btn" disabled={busy || !canManageBanks || !banks.length}>Create request</button>
          </form>
          <div className="panel list-panel"><h2>Blood requests <span>{requests.length}</span></h2>{requests.length === 0 ? <Empty text="No blood requests yet." /> : <div className="card-list">{requests.map((request) => <article className="record-card" key={request.id}><div><div className="record-title"><strong>{request.bloodGroup} · {request.quantityUnits} units</strong><Status value={request.status} /></div><p>Blood bank #{request.bloodBankId} · {request.requestedDate}</p><small>Request #{request.id}</small></div>{canManageBanks && <div className="record-actions"><select value={request.status} onChange={(e) => withAction(() => apiFetch(`/api/bloodrequests/${request.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) }), 'Blood request status updated.')}><option>PENDING</option><option>APPROVED</option><option>REJECTED</option><option>FULFILLED</option></select><button className="text-danger" type="button" onClick={() => withAction(() => apiFetch(`/api/bloodrequests/${request.id}`, { method: 'DELETE' }), 'Blood request deleted.')}>Delete</button></div>}</article>)}</div>}</div>
        </section>
      )}
    </main>
  )
}

export default App
