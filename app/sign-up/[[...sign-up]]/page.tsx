import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { clerkAppearance, clerkEnabled } from "@/lib/clerk-appearance";
import { AuthShell, AuthNotConfigured } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <AuthShell>
      {clerkEnabled ? (
        <SignUp appearance={clerkAppearance} />
      ) : (
        <AuthNotConfigured />
      )}
    </AuthShell>
  );
}
