import type { FormSchema } from "@/types";

/**
 * Persistence boundary for saved forms. The builder and dashboard only talk
 * to this interface — swapping localStorage for Supabase (V2) is a one-line
 * change in lib/storage/index.ts.
 */
export interface StorageAdapter {
  getForms(): Promise<SavedForm[]>;
  getForm(id: string): Promise<SavedForm | null>;
  saveForm(form: SavedForm): Promise<void>;
  deleteForm(id: string): Promise<void>;
  getLastActiveFormId(): Promise<string | null>;
  setLastActiveFormId(id: string): Promise<void>;
}

export type SavedForm = {
  id: string;
  title: string;
  description?: string;
  schema: FormSchema;
  /** ISO timestamp of the last save. */
  savedAt: string;
  /** Increments on every save, starting at 1. */
  version: number;
};

/** Build a SavedForm envelope from a schema, bumping the previous version. */
export function toSavedForm(
  schema: FormSchema,
  previous?: SavedForm | null,
): SavedForm {
  return {
    id: schema.id,
    title: schema.title,
    description: schema.description,
    schema,
    savedAt: new Date().toISOString(),
    version: (previous?.version ?? 0) + 1,
  };
}
