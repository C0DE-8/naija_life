import api from './api'
import { demoBuySpins, demoReadMessage, demoSendMessage, demoSpin, getDemoMessages, saveDemoPreferences, saveDemoSettings, isLocalDemo, getDemoProfile, demoPostComment } from './demo'

export const getMessages = () => isLocalDemo() ? getDemoMessages() : api.get('/game/messages').then(({ data }) => data)
export const sendMessage = (username, content) => isLocalDemo() ? demoSendMessage(username, content) : api.post('/game/messages', { username, content }).then(({ data }) => data)
export const markMessageRead = (id) => isLocalDemo() ? demoReadMessage(id) : api.post(`/game/messages/${id}/read`).then(({ data }) => data)
export const getPreferences = () => isLocalDemo()
  ? Promise.resolve({ player: JSON.parse(localStorage.getItem('naijaLifePlayer') || '{}'), languages: [{ code: 'en', name: 'English' }, { code: 'bg', name: 'Български' }], themes: Array.from({ length: 18 }, (_, index) => ({ id: index + 1, name: `Theme ${index + 1}` })) })
  : api.get('/game/preferences').then(({ data }) => data)
export const saveSettings = (details) => isLocalDemo() ? saveDemoSettings(details) : api.put('/game/settings', details).then(({ data }) => data)
export const savePreferences = (details) => isLocalDemo() ? saveDemoPreferences(details) : api.put('/game/preferences', details).then(({ data }) => data)
export const spinCasino = () => isLocalDemo() ? demoSpin() : api.post('/game/casino/spin').then(({ data }) => data)
export const buyCasinoSpins = (quantity) => isLocalDemo() ? demoBuySpins(quantity) : api.post('/game/casino/spins', { quantity }).then(({ data }) => data)
export const getPlayerProfile = (id) => isLocalDemo() ? getDemoProfile(id) : api.get(`/game/players/${id}`).then(({ data }) => data)
export const postPlayerComment = (id, comment) => isLocalDemo() ? demoPostComment(id, comment) : api.post(`/game/players/${id}/comments`, { comment }).then(({ data }) => data)
