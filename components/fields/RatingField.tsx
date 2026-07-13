"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { FormField } from "@/types";
import { cn } from "@/lib/utils";
import {
  FieldShell,
  errorMessage,
  type FieldComponentProps,
} from "./FieldShell";

const STARS = [1, 2, 3, 4, 5];

/** 1–5 star rating with animated hover states. */
export function RatingField({ field, isPreview = false }: FieldComponentProps) {
  if (!isPreview) {
    return (
      <FieldShell field={field} labelAsLegend>
        <div className="pointer-events-none flex gap-1">
          {STARS.map((star) => (
            <Star key={star} className="size-7 text-line-soft" />
          ))}
        </div>
      </FieldShell>
    );
  }
  return <LiveRatingField field={field} />;
}

function LiveRatingField({ field }: { field: FormField }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errorMessage(errors, field.id);
  const [hovered, setHovered] = useState(0);

  return (
    <FieldShell field={field} error={error} labelAsLegend>
      <Controller
        control={control}
        name={field.id}
        render={({ field: rhf }) => {
          const value = typeof rhf.value === "number" ? rhf.value : 0;
          const active = hovered || value;
          return (
            <div
              role="radiogroup"
              aria-label={field.label}
              className="flex gap-1"
              onMouseLeave={() => setHovered(0)}
            >
              {STARS.map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={value === star}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  onClick={() => rhf.onChange(star)}
                  onBlur={rhf.onBlur}
                  onMouseEnter={() => setHovered(star)}
                  whileHover={{ scale: 1.2, rotate: -8 }}
                  whileTap={{ scale: 0.9 }}
                  className="rounded-sm focus-hard"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      star <= active
                        ? "fill-brand text-ink dark:text-brand"
                        : "text-line-soft",
                    )}
                  />
                </motion.button>
              ))}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}
