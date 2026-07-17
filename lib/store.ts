import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  BuilderState,
  FieldType,
  FormField,
  FormSchema,
  FormSettings,
} from "@/types";
import { FIELD_REGISTRY } from "@/lib/field-registry";
import { nowISO, uid } from "@/lib/utils";

const MAX_HISTORY = 50;

export const SAVED_FORM_PREFIX = "formforge:form:";

export function createEmptyForm(id = "draft"): FormSchema {
  return {
    id,
    title: "Untitled form",
    description: "",
    fields: [],
    settings: {
      submitLabel: "Submit",
      successMessage: "Thanks! Your response has been recorded.",
      theme: "light",
    },
    createdAt: "",
    updatedAt: "",
  };
}

export function createField(type: FieldType, order: number): FormField {
  const def = FIELD_REGISTRY[type];
  return {
    ...structuredClone(def.defaults),
    id: uid("fld"),
    order,
  };
}

function reindex(fields: FormField[]): FormField[] {
  return fields.map((field, index) => ({ ...field, order: index }));
}

export function arrayMove<T>(items: T[], from: number, to: number): T[] {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return items;
  next.splice(to, 0, moved);
  return next;
}

export type BuilderActions = {
  addField: (type: FieldType, atIndex?: number) => string;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  reorderFields: (activeId: string, overId: string) => void;
  moveField: (id: string, direction: -1 | 1) => void;
  selectField: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  exportSchema: () => string;
  loadSchema: (schema: FormSchema) => void;
  resetForm: () => void;
  updateFormMeta: (
    meta: Partial<Pick<FormSchema, "title" | "description">> & {
      settings?: Partial<FormSettings>;
    },
  ) => void;
  saveForm: () => void;
};

export type BuilderStore = BuilderState & BuilderActions;

/**
 * Persist a form snapshot so /preview/[id] (a separate route) can load it.
 * No-ops on the server.
 */
export function persistFormSnapshot(form: FormSchema) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${SAVED_FORM_PREFIX}${form.id}`,
      JSON.stringify(form),
    );
  } catch {
    // Storage full or unavailable — preview will fall back to builder state.
  }
}

export function readFormSnapshot(id: string): FormSchema | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${SAVED_FORM_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as FormSchema) : null;
  } catch {
    return null;
  }
}

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => {
      /** Push a new snapshot onto the history stack (truncating any redo branch). */
      const commit = (form: FormSchema) => {
        const { history, historyIndex } = get();
        const stamped = { ...form, updatedAt: nowISO() };
        const nextHistory = [
          ...history.slice(0, historyIndex + 1),
          stamped,
        ].slice(-MAX_HISTORY);
        set({
          form: stamped,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
          isDirty: true,
        });
      };

      const initialForm = createEmptyForm();

      return {
        form: initialForm,
        selectedFieldId: null,
        history: [initialForm],
        historyIndex: 0,
        isDirty: false,

        addField: (type, atIndex) => {
          const { form } = get();
          const field = createField(type, form.fields.length);
          const fields = form.fields.slice();
          const index =
            atIndex === undefined
              ? fields.length
              : Math.max(0, Math.min(atIndex, fields.length));
          fields.splice(index, 0, field);
          commit({ ...form, fields: reindex(fields) });
          set({ selectedFieldId: field.id });
          return field.id;
        },

        removeField: (id) => {
          const { form, selectedFieldId } = get();
          if (!form.fields.some((f) => f.id === id)) return;
          // Also strip conditional rules that referenced the removed field —
          // a dangling rule would silently hide its target forever.
          const fields = form.fields
            .filter((f) => f.id !== id)
            .map((f) =>
              f.conditional?.fieldId === id
                ? { ...f, conditional: undefined }
                : f,
            );
          commit({ ...form, fields: reindex(fields) });
          if (selectedFieldId === id) set({ selectedFieldId: null });
        },

        updateField: (id, updates) => {
          const { form } = get();
          const fields = form.fields.map((f) =>
            f.id === id ? { ...f, ...updates, id: f.id } : f,
          );
          commit({ ...form, fields });
        },

        reorderFields: (activeId, overId) => {
          const { form } = get();
          const from = form.fields.findIndex((f) => f.id === activeId);
          const to = form.fields.findIndex((f) => f.id === overId);
          if (from === -1 || to === -1 || from === to) return;
          commit({ ...form, fields: reindex(arrayMove(form.fields, from, to)) });
        },

        moveField: (id, direction) => {
          const { form } = get();
          const from = form.fields.findIndex((f) => f.id === id);
          const to = from + direction;
          if (from === -1 || to < 0 || to >= form.fields.length) return;
          commit({ ...form, fields: reindex(arrayMove(form.fields, from, to)) });
        },

        selectField: (id) => set({ selectedFieldId: id }),

        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex <= 0) return;
          const form = history[historyIndex - 1];
          if (!form) return;
          set({ form, historyIndex: historyIndex - 1, isDirty: true });
        },

        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex >= history.length - 1) return;
          const form = history[historyIndex + 1];
          if (!form) return;
          set({ form, historyIndex: historyIndex + 1, isDirty: true });
        },

        exportSchema: () => JSON.stringify(get().form, null, 2),

        loadSchema: (schema) => {
          set({
            form: schema,
            history: [schema],
            historyIndex: 0,
            selectedFieldId: null,
            isDirty: false,
          });
        },

        resetForm: () => {
          const fresh = createEmptyForm(uid("form"));
          set({
            form: fresh,
            history: [fresh],
            historyIndex: 0,
            selectedFieldId: null,
            isDirty: false,
          });
        },

        updateFormMeta: (meta) => {
          const { form } = get();
          commit({
            ...form,
            ...(meta.title !== undefined ? { title: meta.title } : {}),
            ...(meta.description !== undefined
              ? { description: meta.description }
              : {}),
            settings: { ...form.settings, ...(meta.settings ?? {}) },
          });
        },

        saveForm: () => {
          const { form } = get();
          const stamped = {
            ...form,
            createdAt: form.createdAt || nowISO(),
            updatedAt: nowISO(),
          };
          persistFormSnapshot(stamped);
          set({ form: stamped, isDirty: false });
        },
      };
    },
    {
      name: "formforge:builder",
      storage: createJSONStorage(() => localStorage),
      // Only the form itself is persisted; history is rebuilt on load.
      partialize: (state) => ({ form: state.form }),
      merge: (persisted, current) => {
        const saved = (persisted as { form?: FormSchema } | undefined)?.form;
        if (!saved) return current;
        return {
          ...current,
          form: saved,
          history: [saved],
          historyIndex: 0,
        };
      },
      // Rehydrate manually after mount to avoid SSR hydration mismatches.
      skipHydration: true,
    },
  ),
);
