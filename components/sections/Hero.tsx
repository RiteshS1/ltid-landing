"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import SplitHeading from "@/components/ui/SplitHeading";
import Marquee from "@/components/ui/Marquee";
import { gsap, useGSAP } from "@/lib/gsap";
import { globeState } from "@/lib/globeState";

export default function Hero() {
  const t = useTranslations("Hero");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-fade", { opacity: 0, y: 24, duration: 1.1, ease: "power3.out", stagger: 0.1, delay: 0.7 });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        globeState.reveal[0] = 1;
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="top" ref={root} className="relative z-10 flex min-h-svh flex-col text-sumi">
      <div className="flex flex-1 items-start px-5 pb-16 pt-24 md:items-center md:px-8 md:pt-28">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-2xl">
            <p className="hero-fade mb-7 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center bg-shu font-serif text-base font-bold text-paper">農</span>
              <span className="eyebrow">{t("eyebrow")}</span>
            </p>
            <h1 className="font-display text-[clamp(2.3rem,5vw,4.7rem)] font-extrabold leading-[1.08] tracking-tight">
              <SplitHeading as="span" immediate delay={0.2} className="block pb-1">
                {t("titleLine1")}
              </SplitHeading>
              <SplitHeading as="span" immediate delay={0.4} className="block pb-2 text-shu">
                {t("titleLine2")}
              </SplitHeading>
            </h1>
            <p className="hero-fade mt-6 max-w-xl text-base font-medium leading-8 md:text-lg">{t("subtitle")}</p>
            <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#problem"
                className="group inline-flex items-center gap-2 rounded-full bg-sumi px-7 py-3.5 text-sm font-bold text-paper transition-colors hover:bg-shu"
              >
                {t("ctaPrimary")}
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
              <a
                href="#contact"
                className="rounded-full border-2 border-sumi px-7 py-3 text-sm font-bold transition-colors hover:bg-sumi hover:text-paper"
              >
                {t("ctaSecondary")}
              </a>
            </div>
            <ul className="hero-fade mt-10 hidden flex-wrap gap-2 sm:flex">
              {(t.raw("tags") as string[]).map((tag) => (
                <li key={tag} className="border-2 border-sumi bg-paper/60 px-3 py-1 text-xs font-bold">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="hero-fade absolute bottom-20 right-8 hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] [@media(hover:hover)]:flex">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-shu" />
        {t("hint")}
      </p>
      <Marquee text={t("marquee")} className="border-y-2 border-sumi bg-sumi py-3 text-paper" />
    </section>
  );
}
