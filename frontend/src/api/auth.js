import api from './api'
import { enterLocalDemo } from './demo'

export async function signIn(credentials) {
  if (credentials.username?.trim().toLowerCase() === 'demo' && credentials.password === 'demo') return enterLocalDemo()
  const { data } = await api.post('/auth/signin', credentials)
  saveAuth(data)
  return data
}

export async function signUp(details) {
  const { data } = await api.post('/auth/signup', details)
  saveAuth(data)
  return data
}

export function signOut() {
  const token = localStorage.getItem('naijaLifeToken')
  if (token && token !== 'demo-local-session') api.post('/auth/signout').catch(() => {})
  localStorage.removeItem('naijaLifeToken')
  localStorage.removeItem('naijaLifePlayer')
  localStorage.removeItem('naijaLifeDemoMode')
}

export function saveAuth({ token, player }) {
  localStorage.removeItem('naijaLifeDemoMode')
  localStorage.setItem('naijaLifeToken', token)
  localStorage.setItem('naijaLifePlayer', JSON.stringify(player))
}

export function getApiError(error) {
  if (error.message && !error.response && error.message !== 'Network Error') return error.message
  if (error.response?.data?.message) return error.response.data.message
  if (error.code === 'ERR_NETWORK') return 'Could not reach the server. Make sure the backend and database are running.'
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  return 'Something went wrong. Please try again.'
}
