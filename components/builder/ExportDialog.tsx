"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import type { ExportFormat } from "@/types";
import { toEmbedCode, toJSONSchema, toReactCode } from "@/lib/export";
import { useBuilderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB_LABELS: Record<ExportFormat, string> = {
  json: "JSON Schema",
  react: "React Component",
  embed: "Embed Code",
};

/** Export dialog with JSON / React / Embed tabs and copy-to-clipboard. */
export function ExportDialog({
  open,
  onOpenChange,
  initialTab = "json",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: ExportFormat;
}) {
  const form = useBuilderStore((s) => s.form);
  const [tab, setTab] = useState<ExportFormat>(initialTab);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setCopied(false);
    }
  }, [open, initialTab]);

  const outputs = useMemo(
    () => ({
      json: toJSONSchema(form),
      react: toReactCode(form),
      embed: toEmbedCode(form),
    }),
    [form],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(outputs[tab]);
      setCopied(true);
      toast.success(`${TAB_LABELS[tab]} copied to clipboard`);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export “{form.title}”</DialogTitle>
          <DialogDescription>
            Take your form anywhere — as a JSON schema, a ready-to-ship React
            component, or an embeddable snippet.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ExportFormat)}>
          <TabsList>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>
          {(Object.keys(TAB_LABELS) as ExportFormat[]).map((format) => (
            <TabsContent key={format} value={format}>
              <pre className="max-h-80 overflow-auto border-2 border-line bg-ink p-4 font-mono text-xs leading-relaxed text-paper">
                <code>{outputs[format]}</code>
              </pre>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-4 flex justify-end">
          <Button onClick={copy} variant="brand">
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied!" : `Copy ${TAB_LABELS[tab]}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
