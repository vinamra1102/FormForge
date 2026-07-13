"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBuilderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Form-level settings: description, submit label, success message, theme. */
export function FormSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useBuilderStore((s) => s.form);
  const updateFormMeta = useBuilderStore((s) => s.updateFormMeta);

  const [description, setDescription] = useState(form.description ?? "");
  const [submitLabel, setSubmitLabel] = useState(form.settings.submitLabel);
  const [successMessage, setSuccessMessage] = useState(
    form.settings.successMessage,
  );
  const [theme, setTheme] = useState(form.settings.theme);

  useEffect(() => {
    if (open) {
      setDescription(form.description ?? "");
      setSubmitLabel(form.settings.submitLabel);
      setSuccessMessage(form.settings.successMessage);
      setTheme(form.settings.theme);
    }
  }, [open, form]);

  const save = () => {
    updateFormMeta({
      description,
      settings: {
        submitLabel: submitLabel || "Submit",
        successMessage,
        theme,
      },
    });
    toast.success("Form settings updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form settings</DialogTitle>
          <DialogDescription>
            These apply to the whole form — the preview and every export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-description">Description</Label>
            <Textarea
              id="settings-description"
              rows={2}
              value={description}
              placeholder="Shown under the form title"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-submit">Submit button label</Label>
            <Input
              id="settings-submit"
              value={submitLabel}
              onChange={(e) => setSubmitLabel(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-success">Success message</Label>
            <Input
              id="settings-success"
              value={successMessage}
              onChange={(e) => setSuccessMessage(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Form theme</Label>
            <div
              role="group"
              aria-label="Form theme"
              className="grid grid-cols-2 border-2 border-line"
            >
              {(["light", "dark"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={theme === option}
                  onClick={() => setTheme(option)}
                  className={cn(
                    "px-3 py-2 font-display text-xs font-bold uppercase tracking-wide transition-colors focus-hard",
                    theme === option
                      ? "bg-crimson text-white"
                      : "bg-surface text-foreground hover:bg-brand hover:text-ink",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
