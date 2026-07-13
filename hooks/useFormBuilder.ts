"use client";

import { useShallow } from "zustand/react/shallow";
import { useBuilderStore } from "@/lib/store";

/**
 * Convenience hook exposing the builder store as a flat, shallow-compared
 * bag of state + actions. Components that only need one value should keep
 * using `useBuilderStore` with a narrow selector.
 */
export function useFormBuilder() {
  return useBuilderStore(
    useShallow((s) => ({
      form: s.form,
      fields: s.form.fields,
      selectedFieldId: s.selectedFieldId,
      selectedField:
        s.form.fields.find((f) => f.id === s.selectedFieldId) ?? null,
      canUndo: s.historyIndex > 0,
      canRedo: s.historyIndex < s.history.length - 1,
      isDirty: s.isDirty,
      addField: s.addField,
      removeField: s.removeField,
      updateField: s.updateField,
      reorderFields: s.reorderFields,
      moveField: s.moveField,
      selectField: s.selectField,
      undo: s.undo,
      redo: s.redo,
      exportSchema: s.exportSchema,
      loadSchema: s.loadSchema,
      resetForm: s.resetForm,
      updateFormMeta: s.updateFormMeta,
      saveForm: s.saveForm,
    })),
  );
}
