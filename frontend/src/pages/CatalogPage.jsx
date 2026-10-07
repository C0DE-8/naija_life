import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import { getDemoCatalog, isLocalDemo } from '../api/demo'

const catalogTitles = {
  vehicles: 'Vehicle showroom',
  properties: 'Properties',
  pets: 'Pets',
  shop: 'City shop',
  resources: 'Resources',
  leaderboard: 'Leaderboard',
  casino: 'Casino prizes',
  races: 'Street races',
  fights: 'Fight arena',
}

const descriptions = {
  vehicles: 'Browse the cars, aircraft and boats listed in the city showroom.',
  properties: 'Explore properties available to build your income and grow your city life.',
  pets: 'Meet the pets available to join your home.',
  shop: 'Browse equipment, clothes and other items from the city shop.',
  resources: 'See the services available in the original game catalog.',
  leaderboard: 'See how players rank by level and respect.',
  casino: 'Review the prize pool used by the casino wheel.',
  races: 'Find other players in the city to race.',
  fights: 'Find other players in the city arena.',
}

function itemName(item, kind) {
  return item.name || item.property || item.username || item.prizeType || `${kind} #${item.id}`
}

function detailsFor(item, kind) {
  if (kind === 'leaderboard') return [`Level ${item.level}`, `${Number(item.respect).toLocaleString()} respect`, `Power ${item.power}`]
  if (kind === 'races') return [`Level ${item.level}`, `${Number(item.respect).toLocaleString()} respect`]
  if (kind === 'fights') return [`Level ${item.level}`, `${Number(item.respect).toLocaleString()} respect`, `Power ${item.power}`]
  if (kind === 'casino') return [`${item.value} ${item.prizeType}`]
  if (kind === 'resources') return [`${item.amount} ${item.type}`, `${item.cost} ${item.currency}`]
  const fields = []
  if (item.category) fields.push(item.category)
  if (item.minLevel) fields.push(`Level ${item.minLevel}+`)
  if (item.bonusType) fields.push(`+${item.bonusValue} ${item.bonusType}`)
  if (item.speed) fields.push(`Speed ${item.speed}`)
  if (item.income) fields.push(`Income ${Number(item.income).toLocaleString()} / ${item.time} ${item.format}`)
  if (item.capacity !== undefined) fields.push(`Capacity ${item.capacity}`)
  if (item.respect) fields.push(`${Number(item.respect).toLocaleString()} respect`)
  if (item.money) fields.push(`$${Number(item.money).toLocaleString()}`)
  if (item.gold) fields.push(`${item.gold} gold`)
  return fields.slice(0, 4)
}

const purchaseKinds = { vehicles: 'vehicle', properties: 'property', pets: 'pet', shop: 'item', 'home-upgrades': 'home', 'garage-upgrades': 'garage', 'hangar-upgrades': 'hangar', 'quay-upgrades': 'quay' }

export default function CatalogPage({ kind, onAction, busy = false, refreshKey = '' }) {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const request = isLocalDemo() ? getDemoCatalog(kind) : api.get(`/game/catalog/${kind}`).then(({ data }) => data)
    request.then((data) => {
      if (active) setItems(data.items)
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || 'Could not load this city catalog.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [kind, refreshKey])

  const categories = useMemo(() => ['All', ...new Set(items.map((item) => item.category).filter(Boolean))], [items])
  const filtered = useMemo(() => items.filter((item) => itemName(item, kind).toLowerCase().includes(query.toLowerCase()) && (category === 'All' || item.category === category)), [items, kind, query, category])
  const interactive = ['races', 'fights'].includes(kind)

  return <div className="city-page">
    <div className="page-intro"><div><span className="card-kicker">NAIJA CITY</span><p>{descriptions[kind]}</p></div>{!['leaderboard', 'casino'].includes(kind) && <input className="catalog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${catalogTitles[kind].toLowerCase()}`} aria-label={`Search ${catalogTitles[kind]}`} />}</div>
    {categories.length > 1 && <div className="catalog-categories" aria-label="Filter by category">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>}
    {error && <div className="game-message error-message" role="alert">{error}</div>}
    {loading && <div className="loading-card">Loading {catalogTitles[kind].toLowerCase()}…</div>}
    {!loading && !error && filtered.length === 0 && <div className="loading-card">No listings found.</div>}
    {!loading && !error && <div className="catalog-grid">{filtered.map((item, index) => {
      const propertyReady = kind === 'properties' && item.owned
      const itemAction = purchaseKinds[kind]
      const canPurchase = Boolean(itemAction) && !item.owned
      const buttonText = propertyReady ? 'Collect income' : item.owned ? 'Owned' : canPurchase ? 'Purchase' : interactive ? 'Challenge soon' : 'Available soon'
      return <article className="game-card catalog-card" key={item.id ?? item.username ?? index}>
      <div className="catalog-art" aria-hidden="true">{item.image ? <img src={item.image.startsWith('/') ? item.image : `/ncity/${item.image}`} alt="" loading="lazy" /> : kind === 'vehicles' ? '↗' : kind === 'pets' ? '✦' : kind === 'leaderboard' ? `#${index + 1}` : kind === 'casino' ? '◇' : 'NC'}</div>
      <div className="catalog-main"><span className="card-kicker">{item.category || kind.toUpperCase()}</span><h2>{itemName(item, kind)} {item.owned && <small className="owned-label">OWNED</small>}</h2><div className="catalog-facts">{detailsFor(item, kind).map((detail) => <span key={detail}>{detail}</span>)}</div></div>
      <button className="secondary-game-button catalog-action" disabled={busy || (!canPurchase && !propertyReady)} title={interactive ? 'Player challenges are not connected yet.' : undefined} onClick={() => propertyReady ? onAction('collect-property', item.id) : canPurchase ? onAction(itemAction, item.id) : undefined}>{buttonText}</button>
    </article>
    })}</div>}
    {kind === 'vehicles' && <Link className="catalog-shortcut" to="/vehicle-upgrades">Manage your vehicles and upgrade performance <span>↗</span></Link>}
    <p className="catalog-note">Listings use the original Naija City assets and database. Player challenges and external resource payments are not connected yet.</p>
  </div>
}
