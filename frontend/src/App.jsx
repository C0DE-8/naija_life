import { useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'
import { getApiError, signIn, signUp } from './api/auth'
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

function App() {
  return <Routes>
    <Route path="/" element={<Navigate replace to="/signin" />} />
    <Route path="/signin" element={<AuthPage />} />
    <Route path="/signup" element={<AuthPage />} />
    <Route path="*" element={<Navigate replace to="/signin" />} />
  </Routes>
}

export default App
