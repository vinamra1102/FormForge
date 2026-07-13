"use client";

import type { ComponentType } from "react";
import type { FieldType } from "@/types";
import type { FieldComponentProps } from "./FieldShell";
import { TextField } from "./TextField";
import { TextareaField } from "./TextareaField";
import { SelectField } from "./SelectField";
import { MultiSelectField } from "./MultiSelectField";
import { CheckboxField } from "./CheckboxField";
import { RadioField } from "./RadioField";
import { DateField } from "./DateField";
import { NumberField } from "./NumberField";
import { RatingField } from "./RatingField";
import { FileUploadField } from "./FileUploadField";
import { SectionBreak } from "./SectionBreak";
import { ConditionalField, ConditionalVisibility } from "./ConditionalField";

const FIELD_COMPONENTS: Record<
  FieldType,
  ComponentType<FieldComponentProps>
> = {
  text: TextField,
  textarea: TextareaField,
  select: SelectField,
  multiselect: MultiSelectField,
  checkbox: CheckboxField,
  radio: RadioField,
  date: DateField,
  number: NumberField,
  rating: RatingField,
  file: FileUploadField,
  section: SectionBreak,
  conditional: ConditionalField,
};

/** Render any field by type, in builder or preview mode. */
export function FieldRenderer({ field, isPreview = false }: FieldComponentProps) {
  const Component = FIELD_COMPONENTS[field.type];
  return <Component field={field} isPreview={isPreview} />;
}

export { ConditionalVisibility };
export type { FieldComponentProps };
