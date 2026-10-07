import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'
import { getApiError, signIn, signOut, signUp } from './api/auth'
import { bankTransfer, collectPropertyIncome, finishActivity, getActivities, getDashboard, leaveActivity, purchaseListing, startActivity, upgradeVehicle } from './api/game'
import CatalogPage from './pages/CatalogPage'
import CharacterSelector from './pages/CharacterSelector'
import VehicleUpgradePage from './pages/VehicleUpgradePage'
import MessagesPage from './pages/MessagesPage'
import SettingsPage from './pages/SettingsPage'
import CasinoPage from './pages/CasinoPage'
import { isLocalDemo, resetLocalDemo } from './api/demo'
import './App.css'

function CityMark() {
  return <span className="city-mark" aria-hidden="true"><span /><span /><span /></span>
}

function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const mode = location.pathname === '/signup' ? 'signup' : 'signin'
  const [values, setValues] = useState({ username: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  function switchMode(nextMode) {
    setMessage('')
    navigate(nextMode === 'signup' ? '/signup' : '/signin')
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const data = isSignup ? await signUp(values) : await signIn(values)
      setMessage(`Welcome${isSignup ? ' to Naija Life' : ' back'}, ${data.player.username}!`)
      navigate(isSignup ? '/choose-character' : '/home', { replace: true })
    } catch (error) {
      setMessage(getApiError(error))
    } finally {
      setBusy(false)
    }
  }

  function update(field) {
    return (event) => setValues((current) => ({ ...current, [field]: event.target.value }))
  }

  const isSignup = mode === 'signup'

  return (
    <main className="auth-shell">
      <section className="city-panel" aria-label="Naija Life">
        <div className="panel-topline"><Link className="brand" to="/signin"><CityMark /> NAIJA LIFE</Link><span className="edition">YOUR LIFE. YOUR STORY.</span></div>
        <div className="city-copy">
          <p className="eyebrow"><span className="live-dot" /> YOUR LIFE. YOUR RULES.</p>
          <h1>Build your<br /><em>own</em> empire.</h1>
          <p className="city-description">Make your mark. Find your people. Build a life and rise through the ranks.</p>
          <div className="city-stats"><div><strong>01</strong><span>MAKE A NAME</span></div><i /><div><strong>02</strong><span>BUILD YOUR LIFE</span></div><i /><div><strong>03</strong><span>OWN THE CITY</span></div></div>
        </div>
        <div className="city-art" aria-hidden="true">
          <div className="sun-glow" /><div className="skyline skyline-back"><span /><span /><span /><span /><span /><span /></div>
          <div className="skyline skyline-front"><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="street-light light-one"><i /></div><div className="street-light light-two"><i /></div>
          <div className="road"><div className="road-line" /></div>
        </div>
        <div className="panel-footer"><span>LAGOS, NIGERIA</span><span>06° 27′ N &nbsp; 03° 23′ E</span></div>
      </section>

      <section className="form-panel">
        <div className="mobile-brand"><Link className="brand" to="/signin"><CityMark /> NAIJA LIFE</Link><span className="edition">YOUR LIFE. YOUR STORY.</span></div>
        <div className="form-content">
          <div className="form-heading"><p className="eyebrow">{isSignup ? 'YOUR NEXT CHAPTER STARTS HERE' : 'GOOD TO HAVE YOU BACK'}</p><h2>{isSignup ? 'Claim your corner.' : 'Pick up where you left off.'}</h2><p className="form-intro">{isSignup ? 'Create your player account and step into Naija Life.' : 'Sign in to get back to your life in Naija.'}</p></div>
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'active' : ''} onClick={() => switchMode('signin')}>Sign in</button>
            <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'active' : ''} onClick={() => switchMode('signup')}>Create account</button>
          </div>
          {isSignup ? null : <button className="demo-access-button" onClick={() => setValues({ username: 'demo', email: '', password: 'demo' })} type="button">Fill demo login <span>demo / demo</span></button>}
          <form className="auth-form" onSubmit={submit}>
            <label>Username<input autoComplete="username" minLength="3" maxLength="24" name="username" onChange={update('username')} pattern="[A-Za-z0-9_]+" placeholder="Your city name" required value={values.username} /></label>
            {isSignup && <label>Email address<input autoComplete="email" name="email" onChange={update('email')} placeholder="you@example.com" required type="email" value={values.email} /></label>}
            <label>Password<input autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 8 : undefined} name="password" onChange={update('password')} placeholder={isSignup ? 'At least 8 characters' : 'Your password'} required type="password" value={values.password} /></label>
            {message && <div className={`form-message ${message.startsWith('Welcome') ? 'success' : ''}`} role="status">{message}</div>}
            <button className="submit-button" disabled={busy} type="submit">{busy ? 'One moment…' : isSignup ? 'Create your account' : 'Enter Naija Life'}<FiArrowUpRight aria-hidden="true" /></button>
          </form>
          <p className="terms">By continuing, you agree to play fair and make Naija Life a better place.</p>
        </div>
        <div className="form-footer"><span>© NAIJA LIFE</span><span>MADE FOR THE BOLD</span></div>
      </section>
    </main>
  )
}

const pageLinks = [
  { label: 'Home', path: '/home', group: 'City' },
  { label: 'Vehicles', path: '/vehicles' }, { label: 'Properties', path: '/properties' }, { label: 'Pets', path: '/pets' }, { label: 'Shop', path: '/shop' },
  { label: 'Vehicle upgrades', path: '/vehicle-upgrades', group: 'Upgrades' }, { label: 'Home upgrades', path: '/home-upgrades' }, { label: 'Garage upgrades', path: '/garage-upgrades' }, { label: 'Hangar upgrades', path: '/hangar-upgrades' }, { label: 'Quay upgrades', path: '/quay-upgrades' },
  { label: 'Jobs', path: '/jobs', group: 'Activities' }, { label: 'Gym', path: '/gym' }, { label: 'School', path: '/school' }, { label: 'Bank', path: '/bank' }, { label: 'Hospital', path: '/hospital' },
  { label: 'Street races', path: '/races', group: 'Competition' }, { label: 'Fight arena', path: '/fight-arena' }, { label: 'Leaderboard', path: '/leaderboard' }, { label: 'Casino', path: '/casino' }, { label: 'Resources', path: '/resources' },
  { label: 'Messages', path: '/messages', group: 'Account' }, { label: 'Settings', path: '/settings' },
]
const catalogKinds = { Vehicles: 'vehicles', Properties: 'properties', Pets: 'pets', Shop: 'shop', 'Street races': 'races', 'Fight arena': 'fights', Leaderboard: 'leaderboard', Resources: 'resources', 'Home upgrades': 'home-upgrades', 'Garage upgrades': 'garage-upgrades', 'Hangar upgrades': 'hangar-upgrades', 'Quay upgrades': 'quay-upgrades' }
const activityKinds = { Jobs: 'job', Gym: 'gym', School: 'school', Hospital: 'hospital' }
const pageCopy = {
  'Vehicle upgrades': 'Improve the speed, acceleration and stability of vehicles you own.',
  'Home upgrades': 'Upgrade your home and expand the space available for pets.',
  'Garage upgrades': 'Increase your garage capacity to collect more vehicles.',
  'Hangar upgrades': 'Unlock aircraft storage and increase hangar capacity.',
  'Quay upgrades': 'Expand your quay to make room for more boats.',
  Messages: 'Read private messages and talk with other players in Naija City.',
  Settings: 'Manage your player profile, account details, language and appearance.',
  'Choose character': 'Choose a character and set your starting attributes.',
  'Player profile': 'View this player’s profile, stats and public activity.',
  Administration: 'Manage players, game definitions, payments and global settings.',
}

function Dashboard() {
  const navigate = useNavigate()
  const { playerId } = useParams()
  const location = useLocation()
  const [dashboard, setDashboard] = useState(null)
  const [activities, setActivities] = useState(null)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [clock, setClock] = useState(0)

  const load = useCallback(async () => {
    const [overview, choices] = await Promise.all([getDashboard(), getActivities()])
    setDashboard(overview)
    setActivities(choices)
    if (overview.levelsGained) setMessage(`Level up! You advanced ${overview.levelsGained} level${overview.levelsGained === 1 ? '' : 's'} and received your rewards.`)
  }, [])

  useEffect(() => {
    const request = window.setTimeout(() => {
      load().catch((error) => {
        if (error.response?.status === 401) { signOut(); navigate('/signin', { replace: true }) }
        else setMessage(getApiError(error))
      })
    }, 0)
    return () => window.clearTimeout(request)
  }, [load, navigate])
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function perform(work) {
    setBusy(true); setMessage('')
    try {
      const result = await work()
      setMessage(result.message || 'Done.')
      await load()
    } catch (error) { setMessage(getApiError(error)) }
    finally { setBusy(false) }
  }

  const player = dashboard?.player
  const demoMode = isLocalDemo()
  const active = dashboard?.activeAction
  const routePath = location.pathname
  const routeName = routePath.split('/').filter(Boolean).at(-1) || 'home'
  const section = pageLinks.find((item) => item.path === routePath)?.label || ({ 'vehicle-upgrades': 'Vehicle upgrades', 'home-upgrades': 'Home upgrades', 'garage-upgrades': 'Garage upgrades', 'hangar-upgrades': 'Hangar upgrades', 'quay-upgrades': 'Quay upgrades', 'choose-character': 'Choose character', admin: 'Administration' }[routeName]) || (routePath.startsWith('/player/') ? 'Player profile' : 'City page')
  const secondsLeft = active ? Math.max(0, Math.ceil((active.finishAt * 1000 - clock) / 1000)) : 0
  const activityGroup = activities?.[activityKinds[section]]
  const catalogKind = catalogKinds[section]

  return <main className="game-shell">
    <aside className="game-sidebar">
      <Link className="brand game-brand" to="/dashboard"><CityMark /> NAIJA LIFE</Link>
      <div className="sidebar-player">{player?.avatar ? <img className="player-avatar-image" src={player.avatar.startsWith('images/') ? `/ncity/${player.avatar}` : player.avatar} alt="" /> : <div className="player-avatar">{player?.username?.slice(0, 1).toUpperCase() || 'N'}</div>}<div><strong>{player?.username || 'Loading…'}</strong><span>LEVEL {player?.level || 1}</span></div></div>
      <nav className="game-nav" aria-label="Game sections">{pageLinks.map((item) => <Link key={item.path} className={`${section === item.label ? 'selected' : ''} ${item.group ? 'nav-group-start' : ''}`} to={item.path}>{item.label}</Link>)}{player?.role === 'Admin' && <Link className={`nav-group-start ${routePath.startsWith('/admin') ? 'selected' : ''}`} to="/admin">Administration</Link>}</nav>
      {demoMode && <button className="demo-reset-button" onClick={async () => { resetLocalDemo(); setMessage('Demo progress reset.'); await load() }}>Reset demo progress</button>}
      <button className="signout-button" onClick={() => { signOut(); navigate('/signin', { replace: true }) }}>Sign out</button>
    </aside>
    <section className="game-content">
      <header className="game-header"><div><p className="eyebrow"><span className="live-dot" /> LAGOS, NIGERIA {demoMode && <span className="demo-pill">LOCAL DEMO</span>}</p><h1>{section === 'Home' ? `Welcome, ${player?.username || 'player'}.` : section}</h1></div><div className="online-count"><i /> {dashboard?.online_players ?? '—'} online</div></header>
      {message && <div className="game-message" role="status">{message}</div>}
      {dashboard && ({ Jobs: ['work.jpg', 'Work in the city'], Gym: ['gym.jpg', 'Build your strength'], Hospital: ['hospital1.jpg', 'Recover and get back on your feet'] })[section] && <div className={`activity-banner banner-${section.toLowerCase()}`}><img src={`/ncity/images/backgrounds/${({ Jobs: 'work.jpg', Gym: 'gym.jpg', Hospital: 'hospital1.jpg' })[section]}`} alt="" /><span>{({ Jobs: 'Work in the city', Gym: 'Build your strength', Hospital: 'Recover and get back on your feet' })[section]}</span></div>}
      {!dashboard && <div className="loading-card">Loading your city…</div>}
      {dashboard && section === 'Home' && <>
        <div className="stat-grid">
          <StatCard label="CASH" value={`$${Number(player.money).toLocaleString()}`} detail={`Bank: $${Number(player.bank).toLocaleString()}`} />
          <StatCard label="GOLD" value={Number(player.gold).toLocaleString()} detail={`${player.spins} casino spins`} />
          <StatCard label="ENERGY" value={`${player.energy} / 100`} detail="Used for city activities" percent={player.energy} />
          <StatCard label="HEALTH" value={`${player.health} / 100`} detail="Recover at the hospital" percent={player.health} />
        </div>
        <div className="overview-grid">
          <div className="game-card"><div className="card-heading"><div><span className="card-kicker">YOUR PROGRESS</span><h2>Character stats</h2></div><span className="level-badge">LVL {player.level}</span></div>
            <div className="progress-list">{[['Respect', player.respect, dashboard.nextLevelRespect], ['Power', player.power, 250], ['Agility', player.agility, 250], ['Endurance', player.endurance, 250], ['Intelligence', player.intelligence, 250]].map(([label, value, max]) => <div className="progress-row" key={label}><div><span>{label}</span><strong>{Number(value).toLocaleString()}{max ? ` / ${Number(max).toLocaleString()}` : ''}</strong></div><div className="progress-track"><i style={{ width: `${max ? Math.min(100, Number(value) / Number(max) * 100) : 0}%` }} /></div></div>)}</div>
          </div>
          <div className="game-card action-card"><div className="card-heading"><div><span className="card-kicker">CITY ACTIVITY</span><h2>{active ? active.type : 'Ready when you are'}</h2></div><span className="activity-icon">✦</span></div>{active ? <><p className="muted-copy">Your activity is in progress. Come back when the timer ends to collect your reward.</p><div className="timer-box">{secondsLeft ? `Ready in ${Math.floor(secondsLeft / 3600)}h ${Math.floor(secondsLeft % 3600 / 60)}m ${secondsLeft % 60}s` : 'Ready to collect'}</div><button className="primary-game-button" disabled={busy || secondsLeft > 0} onClick={() => perform(finishActivity)}>Collect reward</button><button className="subtle-game-button" disabled={busy} onClick={() => perform(leaveActivity)}>Leave activity</button></> : <><p className="muted-copy">Work, train, study, or recover to build your life in the city.</p><button className="primary-game-button" onClick={() => navigate('/jobs')}>Find work <FiArrowUpRight /></button></>}</div>
        </div>
        <p className="city-footnote">{dashboard.total_players} players have made Naija Life their home.</p>
      </>}
      {dashboard && activityGroup && <div className="activity-grid">{activityGroup.map((item) => <div className="game-card activity-tile" key={item.id}><span className="card-kicker">{section.toUpperCase()}</span><h2>{item.name}</h2><div className="activity-facts">{Object.entries(item).filter(([key]) => !['id', 'name'].includes(key)).map(([key, value]) => <span key={key}>{key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)} <strong>{value}{key === 'money' || key === 'fee' || key === 'cost' ? ' cash' : ''}</strong></span>)}</div><button className="primary-game-button" disabled={busy || Boolean(active)} onClick={() => perform(() => startActivity(activityKinds[section], item.id))}>{active ? 'Another activity is active' : 'Start activity'} <FiArrowUpRight /></button></div>)}</div>}
      {dashboard && section === 'Bank' && <div className="bank-layout"><div className="game-card bank-balance"><span className="card-kicker">SAFE AND SOUND</span><h2>Your bank balance</h2><strong className="bank-amount">${Number(player.bank).toLocaleString()}</strong><p className="muted-copy">Available cash: ${Number(player.money).toLocaleString()}</p></div><div className="game-card bank-form"><span className="card-kicker">MOVE YOUR MONEY</span><h2>Bank transfer</h2><label>Amount<input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Enter an amount" /></label><div className="bank-buttons"><button className="primary-game-button" disabled={busy || !amount} onClick={() => perform(() => bankTransfer('deposit', Number(amount)))}>Deposit</button><button className="secondary-game-button" disabled={busy || !amount} onClick={() => perform(() => bankTransfer('withdraw', Number(amount)))}>Withdraw</button></div></div></div>}
      {dashboard && catalogKind && <CatalogPage kind={catalogKind} busy={busy} refreshKey={`${player?.money}:${player?.gold}:${player?.respect}:${player?.level}`} onAction={(kind, id) => perform(() => kind === 'collect-property' ? collectPropertyIncome(id) : purchaseListing(kind, id))} />}
      {dashboard && section === 'Vehicle upgrades' && <VehicleUpgradePage busy={busy} refreshKey={`${player?.money}:${player?.respect}`} onUpgrade={(id, stat) => perform(() => upgradeVehicle(id, stat))} />}
      {dashboard && section === 'Messages' && <MessagesPage playerId={player.id} />}
      {dashboard && section === 'Settings' && <SettingsPage />}
      {dashboard && section === 'Casino' && <CasinoPage player={player} onUpdate={load} />}
      {dashboard && section === 'Choose character' && <CharacterSelector player={player} />}
      {dashboard && (pageCopy[section] || section === 'City page') && !catalogKind && !['Choose character', 'Vehicle upgrades', 'Messages', 'Settings'].includes(section) && <LegacyPage section={section} description={pageCopy[section] || 'This page is part of the original Naija City player menu.'} player={player} playerId={playerId} />}
      {dashboard && routePath.startsWith('/admin') && <LegacyPage section="Administration" description={pageCopy.Administration} player={player} />}
    </section>
  </main>
}

function StatCard({ label, value, detail, percent }) {
  return <div className="game-card stat-card"><span className="card-kicker">{label}</span><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span>{percent !== undefined && <div className="stat-meter"><i style={{ width: `${percent}%` }} /></div>}</div>
}

function LegacyPage({ section, description, player, playerId }) {
  const upgrades = [
    { label: 'Vehicle upgrades', path: '/vehicle-upgrades' },
    { label: 'Home upgrades', path: '/home-upgrades' },
    { label: 'Garage upgrades', path: '/garage-upgrades' },
    { label: 'Hangar upgrades', path: '/hangar-upgrades' },
    { label: 'Quay upgrades', path: '/quay-upgrades' },
  ]
  const adminPages = ['Players', 'Items', 'Vehicles', 'Jobs', 'Gym', 'School', 'Hospital', 'Pets', 'Properties', 'Payments', 'Game settings']
  return <div className="city-page">
    <div className="game-card legacy-feature"><span className="card-kicker">{section === 'Administration' ? 'ADMINISTRATION' : 'PLAYER PAGE'}</span><h2>{section === 'Player profile' ? (playerId ? `Player #${playerId}` : `${player.username}’s profile`) : section}</h2><p className="muted-copy">{description}</p><div className="feature-status"><span className="status-dot" /> Page added to the React game navigation</div></div>
    {section.includes('upgrade') || section.includes('Upgrade') ? <div className="game-card"><span className="card-kicker">RELATED UPGRADES</span><div className="related-links">{upgrades.map((item) => <Link key={item.path} to={item.path}>{item.label} <FiArrowUpRight /></Link>)}</div><p className="pending-note">Upgrade listings and purchases still need to be connected to the game API.</p></div> : null}
    {section === 'Administration' ? <div className="game-card"><span className="card-kicker">MANAGEMENT PAGES</span><div className="related-links">{adminPages.map((label) => <Link key={label} to={`/admin/${label.toLowerCase().replaceAll(' ', '-')}`}>{label} <FiArrowUpRight /></Link>)}</div><p className="pending-note">Administration pages are currently navigation shells. Admin API access controls and management actions still need to be added.</p></div> : null}
    {section === 'Settings' ? <div className="game-card"><span className="card-kicker">ACCOUNT</span><div className="settings-summary"><span>Username<strong>{player.username}</strong></span><span>Player level<strong>{player.level}</strong></span><span>Language<strong>{player.language || 'English'}</strong></span><span>Theme<strong>{player.theme || 'Default'}</strong></span></div><p className="pending-note">Account, language and appearance changes are not connected yet.</p></div> : null}
    {section === 'Messages' ? <div className="game-card"><span className="card-kicker">INBOX</span><h2>Your messages</h2><p className="muted-copy">The inbox and read status will appear here when private messaging is connected.</p></div> : null}
    {section === 'Choose character' ? <div className="game-card"><span className="card-kicker">CHARACTER SELECT</span><h2>Make your entrance</h2><p className="muted-copy">Character choices and starting attributes will be loaded here from the character catalog.</p></div> : null}
  </div>
}

function App() {
  const hasSession = Boolean(localStorage.getItem('naijaLifeToken'))
  return <Routes>
    <Route path="/" element={<Navigate replace to={hasSession ? '/home' : '/signin'} />} />
    <Route path="/signin" element={hasSession ? <Navigate replace to="/dashboard" /> : <AuthPage />} />
    <Route path="/signup" element={hasSession ? <Navigate replace to="/dashboard" /> : <AuthPage />} />
    <Route path="/dashboard" element={<Navigate replace to={hasSession ? '/home' : '/signin'} />} />
    <Route path="/player/:playerId" element={hasSession ? <Dashboard /> : <Navigate replace to="/signin" />} />
    <Route path="/admin/*" element={hasSession ? <Dashboard /> : <Navigate replace to="/signin" />} />
    <Route path="/:page" element={hasSession ? <Dashboard /> : <Navigate replace to="/signin" />} />
    <Route path="*" element={<Navigate replace to={hasSession ? '/home' : '/signin'} />} />
  </Routes>
}

export default App
