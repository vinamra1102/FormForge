import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://formforge-vinamra.vercel.app"),
  title: {
    default: "FormForge — Build forms that don't suck",
    template: "%s · FormForge",
  },
  description:
    "Drag. Drop. Validate. Export. FormForge is a drag-and-drop form builder with real validation, conditional logic, and one-click export to JSON, React, or embed code.",
  keywords: [
    "form builder",
    "drag and drop",
    "react hook form",
    "zod",
    "form generator",
    "no code forms",
  ],
  authors: [{ name: "Vinamra Bhonsle" }],
  openGraph: {
    title: "FormForge — Build forms that don't suck",
    description:
      "Drag. Drop. Validate. Export. No code required. 12 field types, real Zod validation, conditional logic, and exports to JSON, React, and embed code.",
    url: "/",
    siteName: "FormForge",
    type: "website",
    images: [
      {
        url: "/illustrations/hero-drag-drop.png",
        width: 1664,
        height: 941,
        alt: "FormForge — drag-and-drop form builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FormForge — Build forms that don't suck",
    description:
      "Drag. Drop. Validate. Export. No code required.",
    images: ["/illustrations/hero-drag-drop.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                border: "2px solid #1a1a1a",
                borderRadius: "0px",
                background: "#fffdf0",
                color: "#1a1a1a",
                fontFamily: "var(--font-inter)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
