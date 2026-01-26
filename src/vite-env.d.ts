/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL_FINANCE: string
  readonly VITE_API_URL_MARGARITA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
