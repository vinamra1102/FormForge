"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CheckSquare,
  ChevronDown,
  Github,
  Hammer,
  Mail,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FIELD_CHIPS = [
  { icon: Mail, label: "Email" },
  { icon: ChevronDown, label: "Dropdown" },
  { icon: CheckSquare, label: "Checkbox" },
  { icon: Calendar, label: "Date" },
  { icon: Star, label: "Rating" },
];

const chipVariants = {
  hidden: { opacity: 0, x: -48, rotate: -4 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { delay: 0.35 + index * 0.09, type: "spring" as const, stiffness: 320, damping: 22 },
  }),
};

/** Yellow editorial hero: headline, CTAs, and the drag-and-drop illustration. */
export function Hero() {
  return (
    <section className="border-b-2 border-ink bg-brand text-ink">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="flex items-center gap-1.5">
          <span className="flex size-9 items-center justify-center border-2 border-ink bg-paper">
            <Hammer className="size-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Form<span className="text-crimson">Forge</span>
          </span>
        </span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hover:bg-ink hover:text-brand">
            <a
              href="https://github.com/vinamra1102/FormForge"
              target="_blank"
              rel="noreferrer"
            >
              <Github />
              <span className="max-sm:hidden">GitHub</span>
            </a>
          </Button>
          <Button asChild size="sm">
            <Link href="/builder">Open builder</Link>
          </Button>
        </div>
      </nav>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-16">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-crimson sm:text-6xl lg:text-7xl"
          >
            Build forms that don&apos;t suck.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            className="mt-5 max-w-md font-display text-xl font-medium sm:text-2xl"
          >
            Drag. Drop. Validate. Export.
            <br />
            No code required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="lg">
              <Link href="/builder">
                Start Building
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-ink text-ink hover:border-crimson hover:bg-paper"
            >
              <a href="#demo">See it live</a>
            </Button>
          </motion.div>

          <div className="mt-10 flex flex-wrap gap-2" aria-hidden>
            {FIELD_CHIPS.map((chip, index) => (
              <motion.span
                key={chip.label}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={chipVariants}
                className="flex items-center gap-1.5 border-2 border-ink bg-paper px-3 py-1.5 font-display text-sm font-bold"
              >
                <chip.icon className="size-4 text-crimson" />
                {chip.label}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
          className="border-2 border-ink bg-paper p-2"
        >
          <Image
            src="/illustrations/hero-drag-drop.png"
            alt="A builder dragging a text field block into a form, with his dog watching"
            width={1664}
            height={941}
            priority
            className="h-auto w-full"
          />
        </motion.div>
      </div>
    </section>
  );
}
