/// <reference types="vite/client" />

// Side-effect imports for Fontsource CSS bundles — these don't ship
// .d.ts files since they're CSS packages, but they're CSS modules that
// Vite imports for the @font-face declarations.
declare module '@fontsource-variable/*'
declare module '@fontsource/*'
