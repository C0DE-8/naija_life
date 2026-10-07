import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiError } from '../api/auth'
import { getPlayerProfile, postPlayerComment } from '../api/player'

export default function PlayerProfilePage({ playerId }) {
  const [profile, setProfile] = useState(null)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() { setProfile(await getPlayerProfile(playerId)) }
  useEffect(() => {
    let mounted = true
    getPlayerProfile(playerId).then((data) => { if (mounted) setProfile(data) }).catch((error) => { if (mounted) setMessage(getApiError(error)) })
    return () => { mounted = false }
  }, [playerId])

  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    try { const result = await postPlayerComment(playerId, comment); setComment(''); setMessage(result.message); await load() }
    catch (error) { setMessage(getApiError(error)) }
    finally { setBusy(false) }
  }

  const player = profile?.player
  return <div className="city-page">{message && <div className="game-message">{message}</div>}{!player && <div className="loading-card">Loading player profile…</div>}{player && <>
    <section className="game-card public-profile"><img src={player.avatar?.startsWith('images/') ? `/ncity/${player.avatar}` : player.avatar} alt="" /><div><span className="card-kicker">PLAYER PROFILE · LEVEL {player.level}</span><h2>{player.username}</h2><p>{player.role}</p></div></section>
    <div className="stat-grid profile-stat-grid"><Stat label="RESPECT" value={player.respect} /><Stat label="POWER" value={player.power} /><Stat label="AGILITY" value={player.agility} /><Stat label="ENDURANCE" value={player.endurance} /><Stat label="INTELLIGENCE" value={player.intelligence} /></div>
    <div className="messages-layout profile-comments"><section className="game-card"><span className="card-kicker">LEAVE A NOTE</span><h2>Write on {player.username}’s profile</h2><form className="game-form" onSubmit={submit}><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={255} rows={4} placeholder="Keep it friendly…" required /><button className="primary-game-button" disabled={busy}>{busy ? 'Posting…' : 'Post comment'}</button></form></section><section className="message-list"><div className="section-title"><div><span className="card-kicker">PUBLIC WALL</span><h2>Recent comments</h2></div></div>{profile.comments.length === 0 && <div className="loading-card">No comments yet.</div>}{profile.comments.map((item) => <article className="game-card message-item" key={item.id}><div><Link to={`/player/${item.authorId}`} className="comment-author">{item.author}</Link><p>{item.comment}</p><time>{item.date} · {item.time}</time></div></article>)}</section></div>
  </>}</div>
}

function Stat({ label, value }) { return <div className="game-card stat-card"><span className="card-kicker">{label}</span><strong className="stat-value">{Number(value).toLocaleString()}</strong></div> }
