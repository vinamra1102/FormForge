import { safeParseFormSchema } from "@/lib/schema";
import {
  getClerkUserId,
  getSupabaseBrowserClient,
} from "@/lib/supabase/client";
import { localStorageAdapter } from "./localStorage.adapter";
import type { SavedForm, StorageAdapter } from "./types";

type FormRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  schema: unknown;
  version: number;
  saved_at: string;
};

function rowToSavedForm(row: FormRow): SavedForm | null {
  const parsed = safeParseFormSchema(row.schema);
  if (!parsed.success) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    schema: parsed.data,
    savedAt: row.saved_at,
    version: row.version,
  };
}

/**
 * Supabase-backed StorageAdapter. Rows are scoped to the signed-in Clerk user
 * both by RLS (`requesting_user_id()`) and an explicit user_id filter.
 * The last-active form id stays in localStorage — it's a UI preference,
 * not data.
 */
export class SupabaseStorageAdapter implements StorageAdapter {
  private client() {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase is not configured");
    return client;
  }

  private userId(): string {
    const id = getClerkUserId();
    if (!id) throw new Error("Sign in to save forms to your account");
    return id;
  }

  async getForms(): Promise<SavedForm[]> {
    const { data, error } = await this.client()
      .from("forms")
      .select("*")
      .eq("user_id", this.userId())
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as FormRow[])
      .map(rowToSavedForm)
      .filter((form): form is SavedForm => form !== null);
  }

  async getForm(id: string): Promise<SavedForm | null> {
    const { data, error } = await this.client()
      .from("forms")
      .select("*")
      .eq("id", id)
      .eq("user_id", this.userId())
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? rowToSavedForm(data as FormRow) : null;
  }

  async saveForm(form: SavedForm): Promise<void> {
    const { error } = await this.client()
      .from("forms")
      .upsert(
        {
          id: form.id,
          user_id: this.userId(),
          title: form.title,
          description: form.description ?? null,
          schema: form.schema,
          version: form.version,
          saved_at: form.savedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);
  }

  async deleteForm(id: string): Promise<void> {
    const { error } = await this.client()
      .from("forms")
      .delete()
      .eq("id", id)
      .eq("user_id", this.userId());
    if (error) throw new Error(error.message);
    await localStorageAdapter.deleteForm(id);
  }

  getLastActiveFormId(): Promise<string | null> {
    return localStorageAdapter.getLastActiveFormId();
  }

  setLastActiveFormId(id: string): Promise<void> {
    return localStorageAdapter.setLastActiveFormId(id);
  }
}

export const supabaseAdapter = new SupabaseStorageAdapter();
