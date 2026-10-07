import { useEffect, useState } from 'react'
import { getApiError } from '../../api/auth'
import { getPreferences, savePreferences, saveSettings } from '../../api/player'

export default function SettingsPage() {
  const [data, setData] = useState(null)
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [password, setPassword] = useState('')
  const [language, setLanguage] = useState('en')
  const [theme, setTheme] = useState(1)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    getPreferences().then((result) => {
      if (!mounted) return
      setData(result); setEmail(result.player.email || ''); setAvatar(result.player.avatar || ''); setLanguage(result.player.language || 'en'); setTheme(Number(result.player.theme || 1))
    }).catch((error) => { if (mounted) setMessage(getApiError(error)) })
    return () => { mounted = false }
  }, [])

  async function saveAccount(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    try { const result = await saveSettings({ email, avatar, password }); setPassword(''); setMessage(result.message) }
    catch (error) { setMessage(getApiError(error)) }
    finally { setBusy(false) }
  }

  async function saveOptions(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    try { const result = await savePreferences({ language, theme }); setMessage(result.message) }
    catch (error) { setMessage(getApiError(error)) }
    finally { setBusy(false) }
  }

  return <div className="city-page settings-page">{message && <div className="game-message" role="status">{message}</div>}
    <section className="game-card"><span className="card-kicker">ACCOUNT</span><h2>Profile and password</h2><form className="game-form settings-form" onSubmit={saveAccount}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required /></label><label>Avatar image path or URL<input value={avatar} onChange={(event) => setAvatar(event.target.value)} maxLength={255} placeholder="images/icons/default-avatar.jpg" /></label><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={72} autoComplete="new-password" placeholder="Leave blank to keep current password" /></label><button className="primary-game-button" disabled={busy}>{busy ? 'Saving…' : 'Save account'}</button></form></section>
    <section className="game-card"><span className="card-kicker">PREFERENCES</span><h2>Language and theme</h2><form className="game-form settings-form" onSubmit={saveOptions}><label>Language<select value={language} onChange={(event) => setLanguage(event.target.value)}>{data?.languages.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label>Theme<select value={theme} onChange={(event) => setTheme(Number(event.target.value))}>{data?.themes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="primary-game-button" disabled={busy || !data}>{busy ? 'Saving…' : 'Save preferences'}</button></form></section>
  </div>
}
