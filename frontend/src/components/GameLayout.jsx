import { useState } from 'react'
import { Link } from 'react-router-dom'
import { pageLinks } from '../config/navigation'

function CityMark() {
  return <span className="city-mark" aria-hidden="true"><span /><span /><span /></span>
}

export default function GameLayout({ player, section, routePath, demoMode, message, onResetDemo, onSignOut, onlinePlayers, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <main className="game-shell">
    <aside className={`game-sidebar ${menuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="desktop-brand"><Link className="brand game-brand" to="/home"><CityMark /> NAIJA LIFE</Link></div>
      <div className="mobile-nav-bar">
        <Link className="brand game-brand" to="/home"><CityMark /> NAIJA LIFE</Link>
        <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="game-navigation" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? 'Close' : 'Menu'}<span aria-hidden="true">{menuOpen ? '×' : '☰'}</span></button>
      </div>
      <div className="game-navigation-wrap" id="game-navigation">
        <div className="sidebar-player">{player?.avatar ? <img className="player-avatar-image" src={player.avatar.startsWith('images/') ? `/ncity/${player.avatar}` : player.avatar} alt="" /> : <div className="player-avatar">{player?.username?.slice(0, 1).toUpperCase() || 'N'}</div>}<div><strong>{player?.username || 'Loading…'}</strong><span>LEVEL {player?.level || 1}</span></div></div>
        <nav className="game-nav" aria-label="Game sections">{pageLinks.map((item) => <Link key={item.path} onClick={() => setMenuOpen(false)} className={`${section === item.label ? 'selected' : ''} ${item.group ? 'nav-group-start' : ''}`} to={item.path}>{item.label}</Link>)}{player?.role === 'Admin' && <Link onClick={() => setMenuOpen(false)} className={`nav-group-start ${routePath.startsWith('/admin') ? 'selected' : ''}`} to="/admin">Administration</Link>}</nav>
        {demoMode && <button className="demo-reset-button" onClick={onResetDemo}>Reset demo progress</button>}
        <button className="signout-button" onClick={onSignOut}>Sign out</button>
      </div>
    </aside>
    <section className="game-content">
      <header className="game-header"><div><p className="eyebrow"><span className="live-dot" /> LAGOS, NIGERIA {demoMode && <span className="demo-pill">LOCAL DEMO</span>}</p><h1>{section === 'Home' ? `Welcome, ${player?.username || 'player'}.` : section}</h1></div><div className="online-count"><i /> {onlinePlayers ?? '—'} online</div></header>
      {message && <div className="game-message" role="status">{message}</div>}
      {children}
    </section>
  </main>
}
