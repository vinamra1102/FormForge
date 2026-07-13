import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  GitBranch,
  Hash,
  ListChecks,
  Minus,
  Star,
  Type,
  Upload,
  type LucideIcon,
} from "lucide-react";
import type { FieldDefinition } from "@/lib/field-registry";

/** Resolve the registry's icon names to actual lucide components. */
export const FIELD_ICONS: Record<FieldDefinition["icon"], LucideIcon> = {
  Type,
  AlignLeft,
  ChevronDown,
  ListChecks,
  CheckSquare,
  CircleDot,
  Calendar,
  Hash,
  Star,
  Upload,
  Minus,
  GitBranch,
};
