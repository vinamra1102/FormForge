"use client";

import { Component, type ReactNode } from "react";
import { useBuilderStore } from "@/lib/store";

type BoundaryProps = {
  children: ReactNode;
  onRemove: () => void;
};

type BoundaryState = { error: Error | null };

/**
 * Error boundaries must be class components. Catches render errors from a
 * single field card so one broken field can't white-screen the canvas.
 */
class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="border-2 border-crimson bg-surface p-4 sm:col-span-2"
        >
          <p className="text-xs font-semibold text-crimson">
            This field failed to render —{" "}
            {this.state.error.message || "unknown error"}
          </p>
          <button
            type="button"
            onClick={this.props.onRemove}
            className="mt-2 font-display text-xs font-bold text-crimson underline underline-offset-2 transition-colors focus-hard hover:text-crimson-deep"
          >
            Remove field
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Wraps a FieldCard; "Remove field" deletes the offending field. */
export function FieldErrorBoundary({
  fieldId,
  children,
}: {
  fieldId: string;
  children: ReactNode;
}) {
  const removeField = useBuilderStore((s) => s.removeField);
  return <Boundary onRemove={() => removeField(fieldId)}>{children}</Boundary>;
}
