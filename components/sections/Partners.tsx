"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import SplitHeading from "@/components/ui/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Partners() {
  const t = useTranslations("Partners");
  const root = useRef<HTMLElement>(null);
  const items = t.raw("items") as { name: string; role: string }[];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".partner", {
          opacity: 0,
          x: -40,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: ".partner-list", start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="partners" ref={root} className="grain relative z-10 bg-paper py-24 md:py-36">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-6 flex items-center gap-3 text-shu">
              <span className="font-display text-3xl font-extrabold">05</span>
              {t("eyebrow")}
            </p>
            <SplitHeading className="font-display text-[clamp(2rem,4.4vw,3.8rem)] font-extrabold leading-[1.15]">
              {t("title")}
            </SplitHeading>
            <p className="mt-7 max-w-md text-base leading-8">{t("lead")}</p>
            <p className="mt-8 inline-block -rotate-2 border-2 border-shu px-3 py-1.5 text-sm font-bold text-shu">
              ✓ {t("licence")}
            </p>
          </div>

          <ul className="partner-list border-b-2 border-sumi">
            {items.map((p) => (
              <li
                key={p.name}
                className="partner group flex flex-col gap-1 border-t-2 border-sumi px-2 py-5 transition-[padding,background-color] duration-300 hover:bg-sun hover:pl-5 md:flex-row md:items-baseline md:justify-between md:gap-6 md:py-6"
              >
                <span className="font-display text-2xl font-extrabold md:text-4xl">{p.name}</span>
                <span className="text-sm font-medium md:text-right">{p.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
