/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BREVO_TRACKER_CLIENT_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
