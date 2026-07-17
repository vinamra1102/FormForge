/** Clerk components restyled to the FormForge editorial brand. */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#C8102E",
    colorBackground: "#FFFDF0",
    colorText: "#1A1A1A",
    fontFamily: "Inter, sans-serif",
    borderRadius: "6px",
  },
  elements: {
    card: "border-2 border-[#1A1A1A] shadow-none rounded-none",
    formButtonPrimary:
      "bg-[#C8102E] hover:bg-[#FFD000] hover:text-[#1A1A1A] transition-colors",
  },
} as const;

export const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);
