import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewClient } from "@/components/preview/PreviewClient";

export const metadata: Metadata = {
  title: "Preview",
  description: "Live preview with real validation and conditional logic.",
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <PreviewClient id={id} />
    </Suspense>
  );
}
