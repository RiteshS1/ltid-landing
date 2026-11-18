"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import SplitHeading from "@/components/ui/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";
import { globeState } from "@/lib/globeState";

export default function Hero() {
  const t = useTranslations("Hero");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-fade", {
          opacity: 0,
          y: 24,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.9,
        });
        gsap.to(globeState.reveal, { 0: 1, duration: 2.6, delay: 1.2, ease: "power2.inOut" });
        gsap.to(".scroll-line", { scaleY: 1, transformOrigin: "top", duration: 1.4, repeat: -1, ease: "power2.inOut", yoyo: true });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        globeState.reveal[0] = 1;
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-svh items-center px-5 pb-24 pt-28 md:px-8"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <p className="eyebrow hero-fade mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-jade" />
            {t("eyebrow")}
          </p>
          <h1 className="font-serif text-[clamp(2.4rem,6.4vw,5.2rem)] font-bold leading-[1.12]">
            <SplitHeading as="span" immediate delay={0.25} className="text-gradient block pb-1">
              {t("titleLine1")}
            </SplitHeading>
            <SplitHeading as="span" immediate delay={0.45} className="block pb-2">
              {t("titleLine2")}
            </SplitHeading>
          </h1>
          <p className="hero-fade mt-7 max-w-xl text-base leading-8 text-paper-dim md:text-lg">
            {t("subtitle")}
          </p>
          <div className="hero-fade mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#problem"
              className="group inline-flex items-center gap-2 rounded-full bg-jade px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.04]"
            >
              {t("ctaPrimary")}
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href="#contact"
              className="glass rounded-full px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-jade/60"
            >
              {t("ctaSecondary")}
            </a>
          </div>
          <ul className="hero-fade mt-12 flex flex-wrap gap-2.5">
            {(t.raw("tags") as string[]).map((tag) => (
              <li key={tag} className="glass rounded-full px-3.5 py-1.5 text-xs text-paper-dim">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hero-fade absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span className="eyebrow !text-[0.65rem] !tracking-[0.35em] text-paper-dim">{t("scroll")}</span>
        <span className="scroll-line block h-10 w-px origin-top scale-y-50 bg-gradient-to-b from-jade to-transparent" />
      </div>
      <p className="eyebrow hero-fade absolute bottom-8 right-8 hidden !text-paper-dim lg:block">
        {t("mapLabel")}
      </p>
    </section>
  );
}
