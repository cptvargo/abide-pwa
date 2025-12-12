/// <reference types="vite/client" />

// Extend Vite's ImportMeta types for ABIDE
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
