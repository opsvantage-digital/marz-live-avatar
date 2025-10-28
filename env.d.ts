/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly GEMINI_API_KEY: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}