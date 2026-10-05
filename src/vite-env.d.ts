/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL_FINANCE: string
  readonly VITE_API_URL_MARGARITA: string
  readonly VITE_WEB_SERVICE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
