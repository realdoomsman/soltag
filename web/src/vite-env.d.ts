/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_TOKEN_MINT: string;
  readonly VITE_REQUIRED_BALANCE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
