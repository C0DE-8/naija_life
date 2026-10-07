import { useEffect, useState } from 'react'
import { getApiError } from '../api/auth'
import { getDemoCatalog, isLocalDemo } from '../api/demo'
import api from '../api/api'
import { buyCasinoSpins, spinCasino } from '../api/player'

export default function CasinoPage({ player, onUpdate }) {
  const [prizes, setPrizes] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let mounted = true
    const request = isLocalDemo() ? getDemoCatalog('casino') : api.get('/game/catalog/casino').then(({ data }) => data)
    request.then((data) => { if (mounted) setPrizes(data.items) }).catch((error) => { if (mounted) setMessage(getApiError(error)) })
    return () => { mounted = false }
  }, [])

  async function spin() {
    setBusy(true); setResult(null); setMessage('')
    try {
      const pending = spinCasino()
      if (isLocalDemo()) await new Promise((resolve) => window.setTimeout(resolve, 1600))
      const response = await pending
      setResult(response.prize); setMessage(response.message); await onUpdate()
    }
    catch (error) { setMessage(getApiError(error)) }
    finally { setBusy(false) }
  }
  async function buy() {
    setBusy(true); setMessage('')
    try { const response = await buyCasinoSpins(quantity); setMessage(response.message); await onUpdate() }
    catch (error) { setMessage(getApiError(error)) }
    finally { setBusy(false) }
  }

  const wheelColors = prizes.map((prize) => prize.color || '#a9824c').join(', ')
  return <div className="city-page casino-page">{message && <div className="game-message" role="status">{message}</div>}
    <div className="casino-layout"><section className="game-card casino-wheel-card"><span className="card-kicker">WHEEL OF FORTUNE</span><div className="casino-wheel-wrap"><span className="wheel-pointer">▼</span><div className={`casino-wheel ${busy ? 'spinning' : ''}`} style={{ background: `conic-gradient(${wheelColors || '#b68b50, #374b39'})` }}><div className="wheel-center">NAIJA<br />CITY</div></div></div>{result && <div className="casino-result" style={{ borderColor: result.color }}>{result.value} {result.type}</div>}<button className="primary-game-button casino-spin-button" disabled={busy || Number(player.spins) < 1} onClick={spin}>{busy ? 'Spinning…' : `Spin · ${player.spins} left`}</button></section>
      <section className="game-card casino-prizes"><span className="card-kicker">PRIZE POOL</span><h2>Every spin can change your day</h2><div className="prize-list">{prizes.map((prize) => <div key={prize.id}><i style={{ background: prize.color }} /><strong>{prize.value} {prize.prizeType}</strong></div>)}</div><div className="buy-spins"><label>Buy spins · $850 each<select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label><button className="secondary-game-button" disabled={busy} onClick={buy}>Buy {quantity} spins · ${quantity * 850}</button></div></section>
    </div>
  </div>
}
