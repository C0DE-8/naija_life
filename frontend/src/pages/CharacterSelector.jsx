import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chooseCharacter, getCharacters } from '../api/game'
import { getApiError } from '../api/auth'

const stats = ['power', 'agility', 'endurance', 'intelligence']

export default function CharacterSelector({ player }) {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [category, setCategory] = useState(1)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    getCharacters().then((result) => { if (mounted) setData(result) }).catch((error) => { if (mounted) setMessage(getApiError(error)) })
    return () => { mounted = false }
  }, [])

  async function submit() {
    if (!selected) return
    setBusy(true); setMessage('')
    try {
      const result = await chooseCharacter(selected)
      setMessage(result.message)
      navigate('/home', { replace: true })
    } catch (error) { setMessage(getApiError(error)) }
    finally { setBusy(false) }
  }

  const options = data?.characters.filter((item) => Number(item.categoryId) === category) || []
  const selectedCharacter = data?.characters.find((item) => item.id === selected)

  return <div className="city-page character-page">
    <div className="page-intro"><div><span className="card-kicker">YOUR FIRST CHOICE</span><p>Pick the character who will make their name in Lagos. Your choice grants +10 to each highlighted stat.</p></div></div>
    {player?.characterId > 0 && <div className="game-message">You have already chosen your character.</div>}
    {message && <div className="game-message" role="status">{message}</div>}
    {!data && <div className="loading-card">Loading characters…</div>}
    {data && <>
      <div className="character-tabs">{data.categories.map((item) => <button key={item.id} className={category === Number(item.id) ? 'active' : ''} onClick={() => { setCategory(Number(item.id)); setSelected(null) }}>{item.name}</button>)}</div>
      <div className="character-grid">{options.map((item) => <button key={item.id} className={`game-card character-option ${selected === item.id ? 'chosen' : ''}`} onClick={() => setSelected(item.id)} disabled={player?.characterId > 0}>
        <img src={`/ncity/${item.image}`} alt="" loading="lazy" /><strong>{item.name}</strong><span>{stats.filter((stat) => item[stat] === 'Yes').map((stat) => `+10 ${stat}`).join(' · ')}</span>
      </button>)}</div>
      <div className="character-submit"><span>{selectedCharacter ? `${selectedCharacter.name} is selected` : 'Choose a character to continue'}</span><button className="primary-game-button" disabled={!selected || busy || player?.characterId > 0} onClick={submit}>{busy ? 'Saving…' : 'Start your life'} <span>↗</span></button></div>
    </>}
  </div>
}
