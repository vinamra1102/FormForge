import type { Metadata } from "next";
import { BuilderShell } from "@/components/builder/BuilderShell";

export const metadata: Metadata = {
  title: "Builder",
  description:
    "Drag fields onto the canvas, configure validation and conditional logic, then export your form.",
};

export default function BuilderPage() {
  return <BuilderShell />;
}
