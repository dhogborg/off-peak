declare global {
  interface Window {
    env: Env
  }
}

export interface Env {
  OAUTH_CLIENT_ID: string
  OAUTH_CALLBACK: string
}
