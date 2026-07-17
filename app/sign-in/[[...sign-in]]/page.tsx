import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkAppearance, clerkEnabled } from "@/lib/clerk-appearance";
import { AuthShell, AuthNotConfigured } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell>
      {clerkEnabled ? (
        <SignIn appearance={clerkAppearance} />
      ) : (
        <AuthNotConfigured />
      )}
    </AuthShell>
  );
}
