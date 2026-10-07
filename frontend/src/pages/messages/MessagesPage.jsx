import { useEffect, useState } from 'react'
import { getApiError } from '../../api/auth'
import { getMessages, markMessageRead, sendMessage } from '../../api/player'

export default function MessagesPage({ playerId }) {
  const [messages, setMessages] = useState([])
  const [username, setUsername] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function load() {
    const data = await getMessages()
    setMessages(data.messages)
  }
  useEffect(() => { let mounted = true; getMessages().then((data) => { if (mounted) setMessages(data.messages) }).catch((error) => { if (mounted) setMessage(getApiError(error)) }); return () => { mounted = false } }, [])

  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    try { const result = await sendMessage(username, content); setMessage(result.message); setContent(''); await load() }
    catch (error) { setMessage(getApiError(error)) }
    finally { setBusy(false) }
  }

  async function markRead(id) {
    try { await markMessageRead(id); await load() }
    catch (error) { setMessage(getApiError(error)) }
  }

  return <div className="city-page"><div className="messages-layout">
    <section className="game-card message-compose"><span className="card-kicker">NEW MESSAGE</span><h2>Write to a player</h2><form className="game-form" onSubmit={submit}><label>Player username<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="e.g. cityboss" required /></label><label>Message<textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={1000} rows={5} placeholder="Write your message…" required /></label><button className="primary-game-button" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button></form></section>
    <section className="message-list"><div className="section-title"><div><span className="card-kicker">INBOX & SENT</span><h2>Recent messages</h2></div><button className="text-button" onClick={() => load().catch((error) => setMessage(getApiError(error)))}>Refresh</button></div>{message && <div className="game-message">{message}</div>}{messages.length === 0 && <div className="loading-card">No messages yet. Send a note to another player.</div>}{messages.map((item) => { const unread = item.toId === playerId && item.viewed === 'No'; return <article className={`game-card message-item ${unread ? 'unread' : ''}`} key={item.id}><div><span className="card-kicker">{item.fromId === playerId ? 'SENT' : 'RECEIVED'}</span><h3>{item.sender} <small>→ {item.recipient}</small></h3><p>{item.content}</p><time>{item.date} · {item.time}</time></div>{unread && <button className="text-button" onClick={() => markRead(item.id)}>Mark read</button>}</article>})}</section>
  </div></div>
}
