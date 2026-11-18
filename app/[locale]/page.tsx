import { setRequestLocale } from "next-intl/server";
import Header from "@/components/ui/Header";
import GlobeBackdrop from "@/components/three/GlobeBackdrop";
import GlobeDirector from "@/components/ui/GlobeDirector";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import HowItWorks from "@/components/sections/HowItWorks";
import Impact from "@/components/sections/Impact";
import Partners from "@/components/sections/Partners";
import Roadmap from "@/components/sections/Roadmap";
import Team from "@/components/sections/Team";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <GlobeBackdrop />
      <GlobeDirector />
      <Header />
      <main className="relative">
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Impact />
        <Partners />
        <Roadmap />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
