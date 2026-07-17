"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type WindowWithClerk = Window & {
  Clerk?: {
    user?: { id: string } | null;
    session?: { getToken(): Promise<string | null> } | null;
  };
};

let client: SupabaseClient | null = null;

/**
 * Browser Supabase client. Requests carry the Clerk session JWT so the
 * `requesting_user_id()` RLS policies resolve to the signed-in user.
 * Returns null when the Supabase env vars are not configured.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (client) return client;

  const clerkFetch: typeof fetch = async (input, init = {}) => {
    let token: string | null = null;
    try {
      token =
        (await (window as WindowWithClerk).Clerk?.session?.getToken()) ?? null;
    } catch {
      // No session — fall through to the anon key.
    }
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };

  client = createBrowserClient(url, key, {
    global: { fetch: clerkFetch },
  });
  return client;
}

/** Clerk user id as seen by the browser, or null when signed out. */
export function getClerkUserId(): string | null {
  if (typeof window === "undefined") return null;
  return (window as WindowWithClerk).Clerk?.user?.id ?? null;
}
