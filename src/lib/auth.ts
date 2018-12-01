import moment from 'moment'
import ClientOAuth2 from 'client-oauth2'

const TOKEN_KEY = 'access_token'
const TOKEN_EXPIERY_KEY = 'expires'

export const client = new ClientOAuth2({
  clientId: window.env.OAUTH_CLIENT_ID,
  accessTokenUri: 'https://thewall.tibber.com/connect/token',
  authorizationUri: 'https://thewall.tibber.com/connect/authorize',
  redirectUri: window.env.OAUTH_CALLBACK,
  scopes: ['tibber_graph', 'price', 'consumption'],
})

export function login() {
  let uri = client.code.getUri()
  window.location.href = uri
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIERY_KEY)
}

interface TokenExchange {
  token: string
  expires: string
}
export async function setToken(uri: string) {
  const code = uri.match(/code=(.+?)&/)
  if (!code) {
    throw new Error('unable to parse code')
  }

  try {
    let response = await fetch('/api/v1/authorize?code=' + code[1])
    if (response.status != 200) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    let result: TokenExchange = await response.json()
    localStorage.setItem(TOKEN_KEY, result.token)
    localStorage.setItem(TOKEN_EXPIERY_KEY, result.expires)
  } catch (err) {
    console.log(err)
    throw new Error('Unable to get token: ' + err.message)
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function isLoggedIn() {
  // Check for token
  if (!getToken()) return false

  // Check for valid expiry
  const expStr = localStorage.getItem(TOKEN_EXPIERY_KEY)
  if (!expStr || expStr === '') return false

  // Check for expiry date after current time
  const expires = moment(expStr)
  if (expires.isBefore(moment())) {
    return false
  }
  return true
}
