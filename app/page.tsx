import { Demo } from "@/components/landing/Demo";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Demo />
      <Footer />
    </>
  );
}
