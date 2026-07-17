import { localStorageAdapter } from "./localStorage.adapter";
import { supabaseAdapter } from "./supabase.adapter";
import type { StorageAdapter } from "./types";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// The single swap point for persistence: Supabase when its env vars are set,
// localStorage otherwise (keys live in .env.local — see .env.local.example).
// To force one adapter, replace the ternary with a direct export:
//   export { localStorageAdapter as storageAdapter } from "./localStorage.adapter";
//   export { supabaseAdapter as storageAdapter } from "./supabase.adapter";
export const storageAdapter: StorageAdapter = supabaseConfigured
  ? supabaseAdapter
  : localStorageAdapter;

export { toSavedForm } from "./types";
export type { SavedForm, StorageAdapter } from "./types";
