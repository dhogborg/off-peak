import ClientOAuth2 from 'client-oauth2'
import { CLIENT_ID, CLIENT_SECRET } from '../secrets/oauth2'
const TOKEN_KEY = 'access_token'

export const client = new ClientOAuth2({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  accessTokenUri: 'https://thewall.tibber.com/connect/token',
  authorizationUri: 'https://thewall.tibber.com/connect/authorize',
  redirectUri: 'http://localhost:3000/auth/callback',
  scopes: ['tibber_graph', 'price', 'consumption'],
})

export function login() {
  let uri = client.code.getUri()
  window.location.href = uri
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function setToken(uri: string) {
  let token = await client.code.getToken(uri)
  localStorage.setItem(TOKEN_KEY, token.accessToken)
  return token
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}
