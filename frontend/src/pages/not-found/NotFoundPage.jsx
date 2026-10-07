import { Link } from 'react-router-dom'

export default function NotFoundPage({ hasSession }) {
  const homePath = hasSession ? '/home' : '/signin'
  return <main className="not-found-page">
    <section className="not-found-card">
      <span className="not-found-code">404 · PAGE NOT FOUND</span>
      <h1>This street doesn’t exist.</h1>
      <p>The page may have moved, or the address may be incorrect.</p>
      <Link className="primary-game-button" to={homePath}>{hasSession ? 'Back to your city' : 'Go to sign in'}</Link>
    </section>
  </main>
}
