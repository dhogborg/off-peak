/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_APP_RELEASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
