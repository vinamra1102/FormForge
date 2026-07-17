import type { SavedForm, StorageAdapter } from "./types";

const FORMS_KEY = "formforge:forms";
const LAST_ACTIVE_KEY = "formforge:last_active";

/**
 * localStorage-backed StorageAdapter. All methods are async even though
 * localStorage is sync so the interface is identical to the Supabase adapter.
 * Server-side (SSR) every method is a safe no-op.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private readAll(): SavedForm[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(FORMS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as SavedForm[]) : [];
    } catch {
      return [];
    }
  }

  private writeAll(forms: SavedForm[]): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
    } catch {
      throw new Error("Browser storage is full or unavailable");
    }
  }

  async getForms(): Promise<SavedForm[]> {
    return [...this.readAll()].sort((a, b) =>
      b.savedAt.localeCompare(a.savedAt),
    );
  }

  async getForm(id: string): Promise<SavedForm | null> {
    return this.readAll().find((form) => form.id === id) ?? null;
  }

  async saveForm(form: SavedForm): Promise<void> {
    const forms = this.readAll();
    const index = forms.findIndex((f) => f.id === form.id);
    if (index === -1) forms.push(form);
    else forms[index] = form;
    this.writeAll(forms);
  }

  async deleteForm(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((form) => form.id !== id));
    if (typeof window !== "undefined") {
      try {
        if (window.localStorage.getItem(LAST_ACTIVE_KEY) === id) {
          window.localStorage.removeItem(LAST_ACTIVE_KEY);
        }
      } catch {
        // ignore
      }
    }
  }

  async getLastActiveFormId(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(LAST_ACTIVE_KEY);
    } catch {
      return null;
    }
  }

  async setLastActiveFormId(id: string): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LAST_ACTIVE_KEY, id);
    } catch {
      // A missing UI preference is not worth surfacing.
    }
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
