"use client";

import { useRef, useState, type DragEvent } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FileText, Upload, X } from "lucide-react";
import type { FormField } from "@/types";
import { cn } from "@/lib/utils";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Drag-and-drop file zone with type/size restrictions. */
export function FileUploadField({
  field,
  isPreview = false,
}: FieldComponentProps) {
  if (!isPreview) {
    return (
      <FieldShell field={field} labelAsLegend>
        <div className="pointer-events-none flex flex-col items-center gap-1 rounded-md border-2 border-dashed border-line-soft bg-surface-muted py-6 text-foreground/50">
          <Upload className="size-6" />
          <span className="text-sm">Drop files here</span>
        </div>
      </FieldShell>
    );
  }
  return <LiveFileUploadField field={field} />;
}

function LiveFileUploadField({ field }: { field: FormField }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <FieldShell field={field} error={error} labelAsLegend>
      <Controller
        control={control}
        name={field.id}
        render={({ field: rhf }) => {
          const files: File[] = Array.isArray(rhf.value) ? rhf.value : [];

          const addFiles = (incoming: FileList | null) => {
            if (!incoming) return;
            rhf.onChange([...files, ...Array.from(incoming)]);
          };

          const removeFile = (index: number) => {
            rhf.onChange(files.filter((_, i) => i !== index));
          };

          const onDrop = (event: DragEvent) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          };

          return (
            <div className="space-y-2">
              <button
                type="button"
                aria-label={`${field.label} — drop files or click to browse`}
                onClick={() => inputRef.current?.click()}
                onBlur={rhf.onBlur}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-md border-2 border-dashed py-6 transition-colors focus-hard",
                  dragging
                    ? "border-crimson bg-brand text-ink"
                    : "border-line bg-surface text-foreground/70 hover:border-crimson hover:bg-brand/40",
                )}
              >
                <Upload className="size-6" />
                <span className="text-sm font-medium">
                  {dragging
                    ? "Drop to upload"
                    : "Drag files here or click to browse"}
                </span>
                {field.maxSizeMB && (
                  <span className="text-xs text-foreground/50">
                    Max {field.maxSizeMB}MB per file
                    {field.accept ? ` · ${field.accept}` : ""}
                  </span>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={field.accept}
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              {files.length > 0 && (
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-2 rounded-md border-2 border-line bg-surface px-3 py-1.5 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText className="size-4 shrink-0 text-crimson" />
                        <span className="truncate">{file.name}</span>
                        <span className="shrink-0 font-mono text-xs text-foreground/50">
                          {formatSize(file.size)}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => removeFile(index)}
                        className="rounded-sm p-0.5 text-foreground/60 transition-colors focus-hard hover:bg-crimson hover:text-white"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}
