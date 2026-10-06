import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function CityMark() {
  return <span className="city-mark" aria-hidden="true"><span /><span /><span /></span>
}

function AuthPage() {
  const [mode, setMode] = useState(window.location.pathname === '/signup' ? 'signup' : 'signin')
  const [values, setValues] = useState({ username: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  function switchMode(nextMode) {
    setMode(nextMode)
    setMessage('')
    window.history.pushState({}, '', nextMode === 'signup' ? '/signup' : '/signin')
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.')

      localStorage.setItem('naijaCityToken', data.token)
      localStorage.setItem('naijaCityPlayer', JSON.stringify(data.player))
      setMessage(`Welcome${mode === 'signup' ? ' to Naija City' : ' back'}, ${data.player.username}!`)
    } catch (error) {
      setMessage(error.message === 'Failed to fetch'
        ? 'Could not reach the server. Make sure the backend and database are running.'
        : error.message)
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
      <section className="city-panel" aria-label="Naija City">
        <div className="panel-topline"><a className="brand" href="/"><CityMark /> NAIJA CITY</a><span className="edition">YOUR CITY. YOUR STORY.</span></div>
        <div className="city-copy">
          <p className="eyebrow"><span className="live-dot" /> THE CITY IS YOURS</p>
          <h1>Build your<br /><em>own</em> empire.</h1>
          <p className="city-description">Make your mark. Find your people. Rise through the ranks of a city that never sleeps.</p>
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
        <div className="mobile-brand"><a className="brand" href="/"><CityMark /> NAIJA CITY</a><span className="edition">YOUR CITY. YOUR STORY.</span></div>
        <div className="form-content">
          <div className="form-heading"><p className="eyebrow">{isSignup ? 'YOUR NEXT CHAPTER STARTS HERE' : 'GOOD TO HAVE YOU BACK'}</p><h2>{isSignup ? 'Claim your corner.' : 'Pick up where you left off.'}</h2><p className="form-intro">{isSignup ? 'Create your player account and step into the city.' : 'Sign in to get back to your city.'}</p></div>
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'active' : ''} onClick={() => switchMode('signin')}>Sign in</button>
            <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'active' : ''} onClick={() => switchMode('signup')}>Create account</button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label>Username<input autoComplete="username" minLength="3" maxLength="24" name="username" onChange={update('username')} pattern="[A-Za-z0-9_]+" placeholder="Your city name" required value={values.username} /></label>
            {isSignup && <label>Email address<input autoComplete="email" name="email" onChange={update('email')} placeholder="you@example.com" required type="email" value={values.email} /></label>}
            <label>Password<input autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 8 : undefined} name="password" onChange={update('password')} placeholder={isSignup ? 'At least 8 characters' : 'Your password'} required type="password" value={values.password} /></label>
            {message && <div className={`form-message ${message.startsWith('Welcome') ? 'success' : ''}`} role="status">{message}</div>}
            <button className="submit-button" disabled={busy} type="submit">{busy ? 'One moment…' : isSignup ? 'Create your account' : 'Enter the city'}<span aria-hidden="true">↗</span></button>
          </form>
          <p className="terms">By continuing, you agree to play fair and make the city a better place.</p>
        </div>
        <div className="form-footer"><span>© NAIJA CITY</span><span>MADE FOR THE BOLD</span></div>
      </section>
    </main>
  )
}

export default AuthPage
