import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnedVehicles } from '../api/game'
import { getApiError } from '../api/auth'

const stats = ['speed', 'acceleration', 'stability']

export default function VehicleUpgradePage({ busy, refreshKey, onUpgrade }) {
  const [vehicles, setVehicles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    getOwnedVehicles().then((data) => { if (mounted) setVehicles(data.vehicles) }).catch((requestError) => { if (mounted) setError(getApiError(requestError)) }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [refreshKey])

  return <div className="city-page">
    <div className="page-intro"><div><span className="card-kicker">GARAGE WORKSHOP</span><p>Improve vehicle stats for street races. Each point costs eight times the current stat and adds 50 respect.</p></div></div>
    {error && <div className="game-message error-message">{error}</div>}
    {loading && <div className="loading-card">Loading your garage…</div>}
    {!loading && vehicles.length === 0 && <div className="game-card"><h2>No vehicles yet</h2><p className="muted-copy">Buy a garage and a vehicle before upgrading performance.</p><Link className="primary-game-button" to="/garage-upgrades">View garage upgrades</Link></div>}
    {!loading && <div className="vehicle-upgrade-grid">{vehicles.map((vehicle) => <article className="game-card vehicle-upgrade-card" key={vehicle.id}>
      <div className="vehicle-upgrade-art"><img src={`/ncity/${vehicle.image}`} alt="" /></div><div className="vehicle-upgrade-title"><span className="card-kicker">{vehicle.category}</span><h2>Vehicle #{vehicle.id}</h2></div>
      <div className="vehicle-stat-list">{stats.map((stat) => <div key={stat}><span>{stat}</span><strong>{vehicle[stat]}</strong><button className="secondary-game-button" disabled={busy || vehicle[stat] >= 500} onClick={() => onUpgrade(vehicle.id, stat)}>Upgrade · ${Number(vehicle[stat]) * 8}</button></div>)}</div>
    </article>)}</div>}
  </div>
}
