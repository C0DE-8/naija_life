import api from './api'

export async function signIn(credentials) {
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
  localStorage.removeItem('naijaLifeToken')
  localStorage.removeItem('naijaLifePlayer')
}

export function saveAuth({ token, player }) {
  localStorage.setItem('naijaLifeToken', token)
  localStorage.setItem('naijaLifePlayer', JSON.stringify(player))
}

export function getApiError(error) {
  if (error.response?.data?.message) return error.response.data.message
  if (error.code === 'ERR_NETWORK') return 'Could not reach the server. Make sure the backend and database are running.'
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  return 'Something went wrong. Please try again.'
}
