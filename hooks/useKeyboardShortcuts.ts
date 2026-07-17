"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/lib/store";
import { TOGGLE_SHORTCUTS_EVENT } from "@/lib/shortcuts";
import { isEditableTarget } from "@/hooks/useUndo";

/** True while any dialog, dropdown menu, or bottom sheet is open. */
function overlayOpen(): boolean {
  return Boolean(
    document.querySelector(
      '[role="dialog"], [role="menu"][data-state="open"]',
    ),
  );
}

function focusPaletteSearch() {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    'input[aria-label="Search field types"]',
  );
  for (const input of inputs) {
    // Only the visible variant (mobile/tablet/desktop are CSS-switched).
    if (input.offsetParent !== null) {
      input.focus();
      return;
    }
  }
}

function focusEditorFirstInput() {
  // Wait a tick so the editor panel can mount after selection.
  requestAnimationFrame(() => {
    const editor = document.querySelector<HTMLElement>(
      '[aria-label^="Edit"]',
    );
    editor
      ?.querySelector<HTMLElement>("input, textarea, [role=\"tab\"]")
      ?.focus();
  });
}

/**
 * Global builder shortcuts (see lib/shortcuts.ts for the registry shown in
 * the panel). Skipped while typing in inputs; most are also skipped while a
 * modal/sheet is open. Tab-cycling only kicks in once a field is selected so
 * normal focus navigation keeps working everywhere else.
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const store = useBuilderStore.getState();
      const meta = event.metaKey || event.ctrlKey;
      const editing = isEditableTarget(event.target);

      // Ctrl+S must save even while typing in an editor input.
      if (meta && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void store.saveForm();
        return;
      }

      if (editing) return;

      // Undo/redo work regardless of open overlays.
      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (meta && event.key.toLowerCase() === "y") {
        event.preventDefault();
        store.redo();
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent(TOGGLE_SHORTCUTS_EVENT));
        return;
      }

      if (overlayOpen()) return;

      switch (event.key) {
        case "Escape":
          if (store.selectedFieldId) {
            event.preventDefault();
            store.selectField(null);
          }
          break;
        case "Delete":
        case "Backspace":
          if (store.selectedFieldId) {
            event.preventDefault();
            store.removeField(store.selectedFieldId);
          }
          break;
        case "d":
        case "D":
          if (store.selectedFieldId && !meta) {
            event.preventDefault();
            store.duplicateField(store.selectedFieldId);
          }
          break;
        case "e":
        case "E":
          if (store.selectedFieldId && !meta) {
            event.preventDefault();
            focusEditorFirstInput();
          }
          break;
        case "/":
          event.preventDefault();
          focusPaletteSearch();
          break;
        case "Tab":
          // Cycle fields only once one is selected — plain Tab keeps
          // native focus navigation intact.
          if (store.selectedFieldId && store.form.fields.length > 0) {
            event.preventDefault();
            if (event.shiftKey) store.selectPreviousField();
            else store.selectNextField();
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
