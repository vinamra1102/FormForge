// The single swap point for persistence. V2 (Phase 2) switches this to the
// Supabase adapter when its env vars are configured.
export { localStorageAdapter as storageAdapter } from "./localStorage.adapter";
export { toSavedForm } from "./types";
export type { SavedForm, StorageAdapter } from "./types";
