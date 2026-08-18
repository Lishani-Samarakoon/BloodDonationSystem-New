import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiFetch, getGatewayUrl } from './api'
import { hasRole, initAuth, login, logout } from './auth'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const today = new Date().toISOString().slice(0, 10)

const initialUser = {
  name: '',
  email: '',
  bloodGroup: 'O+',
  phone: '',
  city: '',
  role: 'DONOR',
}

const initialDonation = {
  donorId: '',
  bloodGroup: 'O+',
  quantityMl: 450,
  location: '',
  availableDate: today,
}

const initialBank = {
  name: '',
  address: '',
  city: '',
  phone: '',
}

const initialStock = {
  bloodBankId: '',
  bloodGroup: 'O+',
  quantityUnits: 1,
}

const initialRequest = {
  bloodBankId: '',
  bloodGroup: 'O+',
  quantityUnits: 1,
  requestedDate: today,
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Empty({ text }) {
  return <div className="empty-state">{text}</div>
}

function Status({ value }) {
  return (
    <span className={`status status-${String(value || '').toLowerCase()}`}>
      {value}
    </span>
  )
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
  const [editingUserId, setEditingUserId] = useState(null)
  const [donationForm, setDonationForm] = useState(initialDonation)
  const [bankForm, setBankForm] = useState(initialBank)
  const [editingBankId, setEditingBankId] = useState(null)
  const [stockForm, setStockForm] = useState(initialStock)
  const [editingStockId, setEditingStockId] = useState(null)
  const [requestForm, setRequestForm] = useState(initialRequest)

  const canManageDonations =
    hasRole(session, 'DONOR') || hasRole(session, 'ADMIN')

  const canManageBanks =
    hasRole(session, 'BLOOD_BANK') || hasRole(session, 'ADMIN')

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

    setUserForm((current) => ({
      ...current,
      name: session.name || current.name,
      email: session.email || current.email,
      role: hasRole(session, 'BLOOD_BANK')
        ? 'BLOOD_BANK'
        : hasRole(session, 'ADMIN')
          ? 'ADMIN'
          : 'DONOR',
    }))
  }, [session])

  useEffect(() => {
    if (!session?.email || !users.length) return

    const profile = users.find(
      (user) =>
        user.email?.toLowerCase() === session.email.toLowerCase()
    )

    if (profile) {
      setDonationForm((current) => ({
        ...current,
        donorId: current.donorId || profile.id,
      }))
    }
  }, [users, session])

  async function withAction(action, successMessage) {
    setBusy(true)
    setError('')
    setMessage('')

    try {
      await action()

      if (successMessage) {
        setMessage(successMessage)
      }

      await loadAll(false)
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setBusy(false)
    }
  }

  async function loadAll(showSpinner = true) {
    if (showSpinner) {
      setBusy(true)
    }

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
      if (showSpinner) {
        setBusy(false)
      }
    }
  }

  const stats = useMemo(
    () => ({
      donors: users.filter((user) => user.role === 'DONOR').length,

      availableDonations: donations.filter(
        (donation) => donation.status === 'AVAILABLE'
      ).length,

      stockUnits: stocks.reduce(
        (sum, stock) => sum + Number(stock.quantityUnits || 0),
        0
      ),

      pendingRequests: requests.filter(
        (request) => request.status === 'PENDING'
      ).length,
    }),
    [users, donations, stocks, requests]
  )

  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (authLoading) {
    return (
      <main className="center-screen">
        <div className="loading-card">
          <div className="spinner" />
          Checking login...
        </div>
      </main>
    )
  }

  /* =========================================================
     PROFESSIONAL LOGIN PAGE
  ========================================================= */

  if (!session) {
    return (
      <main className="auth-page">
        <div className="auth-container">

          {/* LEFT SIDE */}
          <section className="auth-content">

            <div className="auth-brand">
              <div className="auth-logo">
                <span>+</span>
              </div>

              <div>
                <h2>LifeLine</h2>
                <p>Blood Donation Network</p>
              </div>
            </div>

            <div className="auth-heading">
              <span className="auth-label">
                BLOOD DONATION MANAGEMENT SYSTEM
              </span>

              <h1>
                Welcome back
                <span>.</span>
              </h1>

              <p>
                Securely access the blood donation network and help connect
                donors, blood banks and patients.
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button
              className="auth-login-btn"
              type="button"
              onClick={login}
            >
              <span className="auth-login-icon">
                🔐
              </span>

              Sign in with Keycloak
            </button>

            <div className="demo-accounts-card">

              <div className="demo-header">
                <div>
                  <span className="demo-small-title">
                    DEMO ACCESS
                  </span>

                  <h3>Choose a test account</h3>
                </div>

                <span className="demo-secure">
                  Secure
                </span>
              </div>

              <div className="demo-account-row">
                <div className="demo-user">

                  <div className="demo-avatar donor-avatar">
                    D
                  </div>

                  <div>
                    <strong>Donor</strong>
                    <small>Donation access</small>
                  </div>
                </div>

                <code>
                  donor1 / donor123
                </code>
              </div>

              <div className="demo-account-row">
                <div className="demo-user">

                  <div className="demo-avatar bank-avatar">
                    B
                  </div>

                  <div>
                    <strong>Blood Bank</strong>
                    <small>Bank management</small>
                  </div>
                </div>

                <code>
                  bank1 / bank123
                </code>
              </div>

              <div className="demo-account-row">
                <div className="demo-user">

                  <div className="demo-avatar admin-avatar">
                    A
                  </div>

                  <div>
                    <strong>Administrator</strong>
                    <small>Full system access</small>
                  </div>
                </div>

                <code>
                  admin1 / admin123
                </code>
              </div>

            </div>

            <div className="auth-footer">

              <div className="auth-security">
                <span>✓</span>

                <p>
                  Authentication protected by Keycloak OAuth2
                </p>
              </div>

              <div className="auth-services">

                <span>
                  Keycloak
                  <b>localhost:8180</b>
                </span>

                <span className="auth-dot">
                  •
                </span>

                <span>
                  Gateway
                  <b>{getGatewayUrl()}</b>
                </span>

              </div>

            </div>

          </section>


          {/* RIGHT SIDE */}
          <section className="auth-visual">

            <div className="visual-circle visual-circle-one"></div>
            <div className="visual-circle visual-circle-two"></div>

            <div className="visual-top">
              <span className="live-dot"></span>
              LifeLine Network
            </div>

            <div className="visual-content">

              <span className="visual-eyebrow">
                GIVE BLOOD • GIVE HOPE
              </span>

              <h2>
                Your donation
                <br />
                can save a life.
              </h2>

              <p>
                One small act can make a life-changing difference
                for someone in need.
              </p>

              <div className="blood-heart">
                <span>♥</span>

                <div className="blood-cross">
                  +
                </div>
              </div>

            </div>

            <div className="visual-stats">

              <div>
                <strong>Secure</strong>
                <span>OAuth2 Access</span>
              </div>

              <div>
                <strong>Fast</strong>
                <span>Microservices</span>
              </div>

              <div>
                <strong>Connected</strong>
                <span>Blood Network</span>
              </div>

            </div>

          </section>

        </div>
      </main>
    )
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

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

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="topbar">

        <div className="brand-row">

          <div className="brand-mark small">
            +
          </div>

          <div>
            <p className="eyebrow">
              Blood Donation System
            </p>

            <h1>
              LifeLine Network
            </h1>
          </div>

        </div>

        <div className="user-area">

          <div className="user-copy">

            <strong>
              {session.name}
            </strong>

            <span>
              {session.roles
                .filter((role) =>
                  ['DONOR', 'BLOOD_BANK', 'ADMIN'].includes(role)
                )
                .join(' · ') || 'Authenticated user'}
            </span>

          </div>

          <button
            className="secondary-btn"
            type="button"
            onClick={() => loadAll()}
          >
            Refresh
          </button>

          <button
            className="danger-btn"
            type="button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =====================================================
          NAVIGATION TABS
      ===================================================== */}

      <nav className="nav-tabs">

        {navItems.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}

      </nav>

      {/* =====================================================
          GLOBAL MESSAGES
      ===================================================== */}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {busy && (
        <div className="progress">
          <span />
        </div>
      )}

      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      {tab === 'dashboard' && (
        <section className="content-stack">

          <div className="hero-panel">

            <div>

              <span className="badge">
                OAuth2 + API Gateway + Microservices
              </span>

              <h2>
                Live data from the Blood Donation Management System
              </h2>

              <p>
                These figures are calculated from real API responses
                instead of hard-coded dashboard values.
              </p>

            </div>

            <div className="metric-grid">

              <div className="metric-card">
                <strong>
                  {stats.donors}
                </strong>

                <span>
                  Registered donors
                </span>
              </div>

              <div className="metric-card">
                <strong>
                  {stats.availableDonations}
                </strong>

                <span>
                  Available donations
                </span>
              </div>

              <div className="metric-card">
                <strong>
                  {stats.stockUnits}
                </strong>

                <span>
                  Blood stock units
                </span>
              </div>

              <div className="metric-card">
                <strong>
                  {stats.pendingRequests}
                </strong>

                <span>
                  Pending requests
                </span>
              </div>

            </div>

          </div>

          <div className="info-grid">

            <article className="panel">
              <h3>Security flow</h3>

              <p>
                Client → OAuth2 bearer token → API Gateway →
                service-specific X-API-KEY → microservice.
              </p>
            </article>

            <article className="panel">
              <h3>Current access</h3>

              <p>
                {canManageDonations
                  ? 'Donation management enabled. '
                  : ''}

                {canManageBanks
                  ? 'Blood-bank management enabled. '
                  : ''}

                {isAdmin
                  ? 'Administrator access enabled.'
                  : ''}
              </p>
            </article>

            <article className="panel">
              <h3>Rate limiting</h3>

              <p>
                Redis-backed limit: 20 business API requests per
                10-second window for each client IP.
              </p>
            </article>

          </div>

        </section>
      )}

      {/* =====================================================
          USERS
      ===================================================== */}

      {tab === 'users' && (
        <section className="workspace-grid">

          <form
            className="panel form-panel"
            onSubmit={(event) => {
              event.preventDefault()

              withAction(
                async () => {
                  await apiFetch(editingUserId ? `/api/users/${editingUserId}` : '/api/users', {
                    method: editingUserId ? 'PUT' : 'POST',
                    body: JSON.stringify(userForm),
                  })

                  setUserForm(initialUser)
                  setEditingUserId(null)
                },
                editingUserId ? 'User profile updated.' : 'User profile created.'
              )
            }}
          >

            <h2>
              {editingUserId ? 'Update user profile' : 'Create user profile'}
            </h2>

            <Field label="Full name">
              <input
                required
                value={userForm.name}
                onChange={(event) =>
                  setUserForm({
                    ...userForm,
                    name: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Email">
              <input
                required
                type="email"
                value={userForm.email}
                onChange={(event) =>
                  setUserForm({
                    ...userForm,
                    email: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Blood group">
              <select
                value={userForm.bloodGroup}
                onChange={(event) =>
                  setUserForm({
                    ...userForm,
                    bloodGroup: event.target.value,
                  })
                }
              >
                {bloodGroups.map((group) => (
                  <option key={group}>
                    {group}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Phone">
              <input
                value={userForm.phone}
                onChange={(event) =>
                  setUserForm({
                    ...userForm,
                    phone: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="City">
              <input
                value={userForm.city}
                onChange={(event) =>
                  setUserForm({
                    ...userForm,
                    city: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Role">
              <select
                value={userForm.role}
                onChange={(event) =>
                  setUserForm({
                    ...userForm,
                    role: event.target.value,
                  })
                }
              >
                <option>DONOR</option>
                <option>BLOOD_BANK</option>

                {isAdmin && (
                  <option>
                    ADMIN
                  </option>
                )}
              </select>
            </Field>

            <button
              className="primary-btn"
              disabled={busy}
            >
              {editingUserId ? 'Update profile' : 'Create profile'}
            </button>

          </form>

          <div className="panel list-panel">

            <h2>
              Users
              <span>
                {users.length}
              </span>
            </h2>

            {users.length === 0 ? (
              <Empty text="No user profiles yet." />
            ) : (
              <div className="table-wrap">

                <table>

                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Blood</th>
                      <th>City</th>
                      <th>Role</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>

                    {users.map((user) => (
                      <tr key={user.id}>

                        <td>
                          {user.id}
                        </td>

                        <td>
                          <strong>
                            {user.name}
                          </strong>

                          <small>
                            {user.email}
                          </small>
                        </td>

                        <td>
                          {user.bloodGroup}
                        </td>

                        <td>
                          {user.city || '—'}
                        </td>

                        <td>
                          {user.role}
                        </td>

                        <td>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserForm({
                                  name: user.name || '',
                                  email: user.email || '',
                                  bloodGroup: user.bloodGroup || '',
                                  phone: user.phone || '',
                                  city: user.city || '',
                                  role: user.role || 'DONOR',
                                })
                                setEditingUserId(user.id)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                            >
                              Edit
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              className="text-danger"
                              type="button"
                              onClick={() =>
                                withAction(
                                  () =>
                                    apiFetch(
                                      `/api/users/${user.id}`,
                                      {
                                        method: 'DELETE',
                                      }
                                    ),
                                  'User deleted.'
                                )
                              }
                            >
                              Delete
                            </button>
                          )}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </section>
      )}

      {/* =====================================================
          DONATIONS
      ===================================================== */}

      {tab === 'donations' && (
        <section className="workspace-grid">

          <form
            className="panel form-panel"
            onSubmit={(event) => {
              event.preventDefault()

              withAction(
                async () => {
                  await apiFetch('/api/donations', {
                    method: 'POST',

                    body: JSON.stringify({
                      ...donationForm,
                      donorId: Number(donationForm.donorId),
                      quantityMl: Number(donationForm.quantityMl),
                    }),
                  })

                  setDonationForm({
                    ...initialDonation,
                    donorId: donationForm.donorId,
                  })
                },
                'Donation created.'
              )
            }}
          >

            <h2>
              Create donation
            </h2>

            {!canManageDonations && (
              <div className="permission-note">
                Your Keycloak role can view donations but cannot
                create or change them.
              </div>
            )}

            <Field label="Donor ID">
              <input
                required
                type="number"
                min="1"
                value={donationForm.donorId}
                onChange={(event) =>
                  setDonationForm({
                    ...donationForm,
                    donorId: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Blood group">
              <select
                value={donationForm.bloodGroup}
                onChange={(event) =>
                  setDonationForm({
                    ...donationForm,
                    bloodGroup: event.target.value,
                  })
                }
              >
                {bloodGroups.map((group) => (
                  <option key={group}>
                    {group}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Quantity (ml)">
              <input
                required
                type="number"
                min="1"
                value={donationForm.quantityMl}
                onChange={(event) =>
                  setDonationForm({
                    ...donationForm,
                    quantityMl: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Location">
              <input
                required
                value={donationForm.location}
                onChange={(event) =>
                  setDonationForm({
                    ...donationForm,
                    location: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Available date">
              <input
                required
                type="date"
                min={today}
                value={donationForm.availableDate}
                onChange={(event) =>
                  setDonationForm({
                    ...donationForm,
                    availableDate: event.target.value,
                  })
                }
              />
            </Field>

            <button
              className="primary-btn"
              disabled={busy || !canManageDonations}
            >
              Create donation
            </button>

          </form>

          <div className="panel list-panel">

            <h2>
              Donations
              <span>
                {donations.length}
              </span>
            </h2>

            {donations.length === 0 ? (
              <Empty text="No donation records yet." />
            ) : (
              <div className="card-list">

                {donations.map((donation) => (
                  <article
                    className="record-card"
                    key={donation.id}
                  >

                    <div>

                      <div className="record-title">
                        <strong>
                          {donation.bloodGroup}
                        </strong>

                        <Status
                          value={donation.status}
                        />
                      </div>

                      <p>
                        {donation.quantityMl} ml ·{' '}
                        {donation.location} ·{' '}
                        {donation.availableDate}
                      </p>

                      <small>
                        Donation #{donation.id} · Donor #
                        {donation.donorId}
                      </small>

                    </div>

                    {canManageDonations && (
                      <div className="record-actions">

                        <select
                          value={donation.status}
                          onChange={(event) =>
                            withAction(
                              () =>
                                apiFetch(
                                  `/api/donations/${donation.id}/status`,
                                  {
                                    method: 'PATCH',

                                    body: JSON.stringify({
                                      status: event.target.value,
                                    }),
                                  }
                                ),
                              'Donation status updated.'
                            )
                          }
                        >
                          <option>AVAILABLE</option>
                          <option>RESERVED</option>
                          <option>COMPLETED</option>
                          <option>CANCELLED</option>
                        </select>

                        <button
                          className="text-danger"
                          type="button"
                          onClick={() =>
                            withAction(
                              () =>
                                apiFetch(
                                  `/api/donations/${donation.id}`,
                                  {
                                    method: 'DELETE',
                                  }
                                ),
                              'Donation deleted.'
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>
                    )}

                  </article>
                ))}

              </div>
            )}

          </div>

        </section>
      )}

      {/* =====================================================
          BLOOD BANKS
      ===================================================== */}

      {tab === 'banks' && (
        <section className="workspace-grid">

          <form
            className="panel form-panel"
            onSubmit={(event) => {
              event.preventDefault()

              withAction(
                async () => {
                  await apiFetch(editingBankId ? `/api/bloodbanks/${editingBankId}` : '/api/bloodbanks', {
                    method: editingBankId ? 'PUT' : 'POST',
                    body: JSON.stringify(bankForm),
                  })

                  setBankForm(initialBank)
                  setEditingBankId(null)
                },
                editingBankId ? 'Blood bank updated.' : 'Blood bank created.'
              )
            }}
          >

            <h2>
              {editingBankId ? 'Update blood bank' : 'Create blood bank'}
            </h2>

            {!canManageBanks && (
              <div className="permission-note">
                Only BLOOD_BANK and ADMIN roles can manage blood banks.
              </div>
            )}

            <Field label="Name">
              <input
                required
                value={bankForm.name}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    name: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Address">
              <input
                required
                value={bankForm.address}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    address: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="City">
              <input
                required
                value={bankForm.city}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    city: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Phone">
              <input
                required
                value={bankForm.phone}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    phone: event.target.value,
                  })
                }
              />
            </Field>

            <button
              className="primary-btn"
              disabled={busy || !canManageBanks}
            >
              {editingBankId ? 'Update blood bank' : 'Create blood bank'}
            </button>

          </form>

          <div className="panel list-panel">

            <h2>
              Blood banks
              <span>
                {banks.length}
              </span>
            </h2>

            {banks.length === 0 ? (
              <Empty text="No blood banks yet." />
            ) : (
              <div className="card-list">

                {banks.map((bank) => (
                  <article
                    className="record-card"
                    key={bank.id}
                  >

                    <div>

                      <div className="record-title">

                        <strong>
                          {bank.name}
                        </strong>

                        <span className="id-chip">
                          #{bank.id}
                        </span>

                      </div>

                      <p>
                        {bank.address}, {bank.city}
                      </p>

                      <small>
                        {bank.phone}
                      </small>

                    </div>

                    {canManageBanks && (
                      <button
                        type="button"
                        onClick={() => {
                          setBankForm({
                            name: bank.name || '',
                            address: bank.address || '',
                            city: bank.city || '',
                            phone: bank.phone || '',
                          })
                          setEditingBankId(bank.id)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      >
                        Edit
                      </button>
                    )}

                    {canManageBanks && (
                      <button
                        className="text-danger"
                        type="button"
                        onClick={() =>
                          withAction(
                            () =>
                              apiFetch(
                                `/api/bloodbanks/${bank.id}`,
                                {
                                  method: 'DELETE',
                                }
                              ),
                            'Blood bank deleted.'
                          )
                        }
                      >
                        Delete
                      </button>
                    )}

                  </article>
                ))}

              </div>
            )}

          </div>

        </section>
      )}

      {/* =====================================================
          BLOOD STOCK
      ===================================================== */}

      {tab === 'stocks' && (
        <section className="workspace-grid">

          <form
            className="panel form-panel"
            onSubmit={(event) => {
              event.preventDefault()

              withAction(
                async () => {
                  await apiFetch(editingStockId ? `/api/bloodstocks/${editingStockId}` : '/api/bloodstocks', {
                    method: editingStockId ? 'PUT' : 'POST',

                    body: JSON.stringify({
                      ...stockForm,
                      bloodBankId: Number(stockForm.bloodBankId),
                      quantityUnits: Number(stockForm.quantityUnits),
                    }),
                  })

                  setStockForm(initialStock)
                  setEditingStockId(null)
                },
                editingStockId ? 'Blood stock updated.' : 'Blood stock created.'
              )
            }}
          >

            <h2>
              {editingStockId ? 'Update blood stock' : 'Add blood stock'}
            </h2>

            {!canManageBanks && (
              <div className="permission-note">
                Only BLOOD_BANK and ADMIN roles can manage stock.
              </div>
            )}

            <Field label="Blood bank">
              <select
                required
                value={stockForm.bloodBankId}
                onChange={(event) =>
                  setStockForm({
                    ...stockForm,
                    bloodBankId: event.target.value,
                  })
                }
              >

                <option value="">
                  Select bank
                </option>

                {banks.map((bank) => (
                  <option
                    key={bank.id}
                    value={bank.id}
                  >
                    #{bank.id} {bank.name}
                  </option>
                ))}

              </select>
            </Field>

            <Field label="Blood group">
              <select
                value={stockForm.bloodGroup}
                onChange={(event) =>
                  setStockForm({
                    ...stockForm,
                    bloodGroup: event.target.value,
                  })
                }
              >

                {bloodGroups.map((group) => (
                  <option key={group}>
                    {group}
                  </option>
                ))}

              </select>
            </Field>

            <Field label="Quantity units">
              <input
                required
                type="number"
                min="0"
                value={stockForm.quantityUnits}
                onChange={(event) =>
                  setStockForm({
                    ...stockForm,
                    quantityUnits: event.target.value,
                  })
                }
              />
            </Field>

            <button
              className="primary-btn"
              disabled={
                busy ||
                !canManageBanks ||
                !banks.length
              }
            >
              Add stock
            </button>

          </form>

          <div className="panel list-panel">

            <h2>
              Blood stock
              <span>
                {stocks.length}
              </span>
            </h2>

            {stocks.length === 0 ? (
              <Empty text="No stock records yet." />
            ) : (
              <div className="table-wrap">

                <table>

                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Bank</th>
                      <th>Blood group</th>
                      <th>Units</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>

                    {stocks.map((stock) => (
                      <tr key={stock.id}>

                        <td>
                          {stock.id}
                        </td>

                        <td>
                          #{stock.bloodBankId}
                        </td>

                        <td>
                          <strong>
                            {stock.bloodGroup}
                          </strong>
                        </td>

                        <td>
                          {stock.quantityUnits}
                        </td>

                        <td>
                          {canManageBanks && (
                            <button
                              type="button"
                              onClick={() => {
                                setStockForm({
                                  bloodBankId: String(stock.bloodBankId || ''),
                                  bloodGroup: stock.bloodGroup || '',
                                  quantityUnits: String(stock.quantityUnits || ''),
                                })
                                setEditingStockId(stock.id)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                            >
                              Edit
                            </button>
                          )}

                          {canManageBanks && (
                            <button
                              className="text-danger"
                              type="button"
                              onClick={() =>
                                withAction(
                                  () =>
                                    apiFetch(
                                      `/api/bloodstocks/${stock.id}`,
                                      {
                                        method: 'DELETE',
                                      }
                                    ),
                                  'Blood stock deleted.'
                                )
                              }
                            >
                              Delete
                            </button>
                          )}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </section>
      )}

      {/* =====================================================
          BLOOD REQUESTS
      ===================================================== */}

      {tab === 'requests' && (
        <section className="workspace-grid">

          <form
            className="panel form-panel"
            onSubmit={(event) => {
              event.preventDefault()

              withAction(
                async () => {
                  await apiFetch('/api/bloodrequests', {
                    method: 'POST',

                    body: JSON.stringify({
                      ...requestForm,
                      bloodBankId: Number(requestForm.bloodBankId),
                      quantityUnits: Number(requestForm.quantityUnits),
                    }),
                  })

                  setRequestForm(initialRequest)
                },
                'Blood request created.'
              )
            }}
          >

            <h2>
              Create blood request
            </h2>

            {!canManageBanks && (
              <div className="permission-note">
                Only BLOOD_BANK and ADMIN roles can manage requests.
              </div>
            )}

            <Field label="Blood bank">
              <select
                required
                value={requestForm.bloodBankId}
                onChange={(event) =>
                  setRequestForm({
                    ...requestForm,
                    bloodBankId: event.target.value,
                  })
                }
              >

                <option value="">
                  Select bank
                </option>

                {banks.map((bank) => (
                  <option
                    key={bank.id}
                    value={bank.id}
                  >
                    #{bank.id} {bank.name}
                  </option>
                ))}

              </select>
            </Field>

            <Field label="Blood group">
              <select
                value={requestForm.bloodGroup}
                onChange={(event) =>
                  setRequestForm({
                    ...requestForm,
                    bloodGroup: event.target.value,
                  })
                }
              >

                {bloodGroups.map((group) => (
                  <option key={group}>
                    {group}
                  </option>
                ))}

              </select>
            </Field>

            <Field label="Quantity units">
              <input
                required
                type="number"
                min="1"
                value={requestForm.quantityUnits}
                onChange={(event) =>
                  setRequestForm({
                    ...requestForm,
                    quantityUnits: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Requested date">
              <input
                required
                type="date"
                value={requestForm.requestedDate}
                onChange={(event) =>
                  setRequestForm({
                    ...requestForm,
                    requestedDate: event.target.value,
                  })
                }
              />
            </Field>

            <button
              className="primary-btn"
              disabled={
                busy ||
                !canManageBanks ||
                !banks.length
              }
            >
              Create request
            </button>

          </form>

          <div className="panel list-panel">

            <h2>
              Blood requests
              <span>
                {requests.length}
              </span>
            </h2>

            {requests.length === 0 ? (
              <Empty text="No blood requests yet." />
            ) : (
              <div className="card-list">

                {requests.map((request) => (
                  <article
                    className="record-card"
                    key={request.id}
                  >

                    <div>

                      <div className="record-title">

                        <strong>
                          {request.bloodGroup} ·{' '}
                          {request.quantityUnits} units
                        </strong>

                        <Status
                          value={request.status}
                        />

                      </div>

                      <p>
                        Blood bank #{request.bloodBankId} ·{' '}
                        {request.requestedDate}
                      </p>

                      <small>
                        Request #{request.id}
                      </small>

                    </div>

                    {canManageBanks && (
                      <div className="record-actions">

                        <select
                          value={request.status}
                          onChange={(event) =>
                            withAction(
                              () =>
                                apiFetch(
                                  `/api/bloodrequests/${request.id}/status`,
                                  {
                                    method: 'PATCH',

                                    body: JSON.stringify({
                                      status: event.target.value,
                                    }),
                                  }
                                ),
                              'Blood request status updated.'
                            )
                          }
                        >
                          <option>PENDING</option>
                          <option>APPROVED</option>
                          <option>REJECTED</option>
                          <option>FULFILLED</option>
                        </select>

                        <button
                          className="text-danger"
                          type="button"
                          onClick={() =>
                            withAction(
                              () =>
                                apiFetch(
                                  `/api/bloodrequests/${request.id}`,
                                  {
                                    method: 'DELETE',
                                  }
                                ),
                              'Blood request deleted.'
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>
                    )}

                  </article>
                ))}

              </div>
            )}

          </div>

        </section>
      )}

    </main>
  )
}

export default App
