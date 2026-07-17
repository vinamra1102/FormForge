import type { BuilderStore } from "@/lib/store";

export type ShortcutCategory =
  | "History"
  | "Fields"
  | "Navigation"
  | "Editor"
  | "Export";

export type Shortcut = {
  id: string;
  category: ShortcutCategory;
  /** Display string, e.g. "Ctrl+Z". */
  key: string;
  description: string;
  /** Store-backed behavior; UI-only shortcuts are handled in the hook. */
  action?: (store: BuilderStore) => void;
};

export const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  "History",
  "Fields",
  "Navigation",
  "Editor",
  "Export",
];

/**
 * The single source of truth for builder shortcuts — rendered by the
 * ShortcutsPanel and executed by useKeyboardShortcuts.
 */
export const shortcuts: Shortcut[] = [
  // History
  {
    id: "undo",
    category: "History",
    key: "Ctrl+Z",
    description: "Undo",
    action: (s) => s.undo(),
  },
  {
    id: "redo",
    category: "History",
    key: "Ctrl+Shift+Z",
    description: "Redo",
    action: (s) => s.redo(),
  },
  {
    id: "redo-alt",
    category: "History",
    key: "Ctrl+Y",
    description: "Redo (alternative)",
    action: (s) => s.redo(),
  },
  // Fields
  {
    id: "delete",
    category: "Fields",
    key: "Del",
    description: "Delete selected field",
    action: (s) => {
      if (s.selectedFieldId) s.removeField(s.selectedFieldId);
    },
  },
  {
    id: "duplicate",
    category: "Fields",
    key: "D",
    description: "Duplicate selected field",
    action: (s) => {
      if (s.selectedFieldId) s.duplicateField(s.selectedFieldId);
    },
  },
  {
    id: "deselect",
    category: "Fields",
    key: "Esc",
    description: "Deselect field",
    action: (s) => s.selectField(null),
  },
  // Navigation
  {
    id: "cycle-next",
    category: "Navigation",
    key: "Tab",
    description: "Select next field",
    action: (s) => s.selectNextField(),
  },
  {
    id: "cycle-prev",
    category: "Navigation",
    key: "Shift+Tab",
    description: "Select previous field",
    action: (s) => s.selectPreviousField(),
  },
  // Editor
  {
    id: "open-editor",
    category: "Editor",
    key: "E",
    description: "Open field editor",
  },
  {
    id: "search",
    category: "Editor",
    key: "/",
    description: "Search field palette",
  },
  // Export
  {
    id: "save",
    category: "Export",
    key: "Ctrl+S",
    description: "Save form",
    action: (s) => void s.saveForm(),
  },
  {
    id: "help",
    category: "Export",
    key: "?",
    description: "Show keyboard shortcuts",
  },
];

/** Cross-component signal for toggling the shortcuts panel. */
export const TOGGLE_SHORTCUTS_EVENT = "formforge:toggle-shortcuts";
