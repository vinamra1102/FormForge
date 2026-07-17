import { beforeEach, describe, expect, it } from "vitest";
import {
  createEmptyForm,
  readFormSnapshot,
  useBuilderStore,
} from "@/lib/store";

function resetStore() {
  const form = createEmptyForm("test-form");
  useBuilderStore.setState({
    form,
    selectedFieldId: null,
    history: [form],
    historyIndex: 0,
    isDirty: false,
  });
}

const store = () => useBuilderStore.getState();

describe("builder store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetStore();
  });

  describe("addField", () => {
    it("adds a field with registry defaults and selects it", () => {
      const id = store().addField("text");
      const { form, selectedFieldId } = store();
      expect(form.fields).toHaveLength(1);
      expect(form.fields[0]).toMatchObject({
        id,
        type: "text",
        label: "Text field",
        required: false,
        width: "full",
        order: 0,
      });
      expect(selectedFieldId).toBe(id);
    });

    it("inserts at a specific index and reindexes order", () => {
      store().addField("text");
      store().addField("number");
      const id = store().addField("date", 1);
      const fields = store().form.fields;
      expect(fields.map((f) => f.type)).toEqual(["text", "date", "number"]);
      expect(fields.map((f) => f.order)).toEqual([0, 1, 2]);
      expect(fields[1]!.id).toBe(id);
    });

    it("gives choice fields default options", () => {
      store().addField("select");
      expect(store().form.fields[0]!.options).toHaveLength(3);
    });

    it("marks the form dirty and stamps updatedAt", () => {
      store().addField("text");
      expect(store().isDirty).toBe(true);
      expect(store().form.updatedAt).not.toBe("");
    });
  });

  describe("removeField", () => {
    it("removes the field and reindexes", () => {
      const a = store().addField("text");
      store().addField("number");
      store().removeField(a);
      const fields = store().form.fields;
      expect(fields).toHaveLength(1);
      expect(fields[0]!.type).toBe("number");
      expect(fields[0]!.order).toBe(0);
    });

    it("deselects the field if it was selected", () => {
      const id = store().addField("text");
      expect(store().selectedFieldId).toBe(id);
      store().removeField(id);
      expect(store().selectedFieldId).toBeNull();
    });

    it("is a no-op for unknown ids", () => {
      store().addField("text");
      const before = store().history.length;
      store().removeField("nope");
      expect(store().history.length).toBe(before);
    });

    it("strips conditional rules referencing the removed field", () => {
      const source = store().addField("text");
      const target = store().addField("text");
      store().updateField(target, {
        conditional: {
          fieldId: source,
          operator: "equals",
          value: "yes",
          action: "show",
        },
      });
      store().removeField(source);
      expect(store().form.fields[0]!.conditional).toBeUndefined();
    });
  });

  describe("updateField", () => {
    it("merges updates but never changes the id", () => {
      const id = store().addField("text");
      store().updateField(id, {
        label: "Email",
        required: true,
        id: "hacked",
      });
      const field = store().form.fields[0]!;
      expect(field.id).toBe(id);
      expect(field.label).toBe("Email");
      expect(field.required).toBe(true);
    });
  });

  describe("reorderFields / moveField", () => {
    it("reorders by ids and reindexes", () => {
      const a = store().addField("text");
      store().addField("number");
      const c = store().addField("date");
      store().reorderFields(a, c);
      expect(store().form.fields.map((f) => f.type)).toEqual([
        "number",
        "date",
        "text",
      ]);
      expect(store().form.fields.map((f) => f.order)).toEqual([0, 1, 2]);
    });

    it("moveField shifts by one and clamps at the edges", () => {
      const a = store().addField("text");
      store().addField("number");
      store().moveField(a, 1);
      expect(store().form.fields.map((f) => f.type)).toEqual([
        "number",
        "text",
      ]);
      const before = store().history.length;
      store().moveField(a, 1); // already last — no-op
      expect(store().history.length).toBe(before);
    });
  });

  describe("undo / redo", () => {
    it("walks history backwards and forwards", () => {
      store().addField("text");
      store().addField("number");
      store().addField("date");
      expect(store().form.fields).toHaveLength(3);

      store().undo();
      expect(store().form.fields).toHaveLength(2);
      store().undo();
      expect(store().form.fields).toHaveLength(1);
      store().redo();
      expect(store().form.fields).toHaveLength(2);
      store().redo();
      expect(store().form.fields).toHaveLength(3);
    });

    it("does nothing at the boundaries", () => {
      store().undo();
      expect(store().form.fields).toHaveLength(0);
      store().redo();
      expect(store().form.fields).toHaveLength(0);
    });

    it("truncates the redo branch on a new action", () => {
      store().addField("text");
      store().addField("number");
      store().undo();
      store().addField("date");
      store().redo(); // nothing to redo
      expect(store().form.fields.map((f) => f.type)).toEqual(["text", "date"]);
    });

    it("caps history at 50 snapshots", () => {
      for (let i = 0; i < 60; i++) store().addField("text");
      expect(store().history.length).toBeLessThanOrEqual(50);
      expect(store().form.fields).toHaveLength(60);
    });

    it("selection changes do not pollute history", () => {
      const id = store().addField("text");
      const before = store().history.length;
      store().selectField(null);
      store().selectField(id);
      expect(store().history.length).toBe(before);
    });
  });

  describe("export / load / reset / meta", () => {
    it("exportSchema returns parseable JSON matching the form", () => {
      store().addField("text");
      const parsed = JSON.parse(store().exportSchema());
      expect(parsed).toEqual(store().form);
    });

    it("loadSchema replaces the form and resets history", () => {
      store().addField("text");
      const incoming = { ...createEmptyForm("other"), title: "Imported" };
      store().loadSchema(incoming);
      expect(store().form.title).toBe("Imported");
      expect(store().history).toHaveLength(1);
      expect(store().isDirty).toBe(false);
    });

    it("resetForm produces a fresh empty form", () => {
      store().addField("text");
      store().resetForm();
      expect(store().form.fields).toHaveLength(0);
      expect(store().form.title).toBe("Untitled form");
      expect(store().history).toHaveLength(1);
    });

    it("updateFormMeta merges title and settings", () => {
      store().updateFormMeta({
        title: "Contact",
        settings: { theme: "dark" },
      });
      expect(store().form.title).toBe("Contact");
      expect(store().form.settings.theme).toBe("dark");
      expect(store().form.settings.submitLabel).toBe("Submit");
    });
  });

  describe("saveForm", () => {
    it("persists a snapshot readable by the preview and clears dirty", async () => {
      store().addField("text");
      expect(store().isDirty).toBe(true);
      await store().saveForm();
      expect(store().isDirty).toBe(false);
      expect(store().lastSavedAt).not.toBeNull();
      const snapshot = readFormSnapshot(store().form.id);
      expect(snapshot?.fields).toHaveLength(1);
      expect(snapshot?.createdAt).not.toBe("");
    });

    it("saves through the storage adapter with version bumps", async () => {
      store().addField("text");
      await store().saveForm();
      store().addField("number");
      await store().saveForm();

      const forms = await store().listForms();
      expect(forms).toHaveLength(1);
      expect(forms[0]!.version).toBe(2);
      expect(forms[0]!.schema.fields).toHaveLength(2);
      expect(forms[0]!.title).toBe(store().form.title);
    });

    it("loadForm restores a saved form by id", async () => {
      store().updateFormMeta({ title: "Saved one" });
      store().addField("text");
      await store().saveForm();
      const savedId = store().form.id;

      store().resetForm();
      expect(store().form.fields).toHaveLength(0);

      await store().loadForm(savedId);
      expect(store().form.title).toBe("Saved one");
      expect(store().form.fields).toHaveLength(1);
      expect(store().isDirty).toBe(false);
    });

    it("deleteForm removes it from the adapter", async () => {
      store().addField("text");
      await store().saveForm();
      const id = store().form.id;
      await store().deleteForm(id);
      expect(await store().listForms()).toHaveLength(0);
    });
  });
});
