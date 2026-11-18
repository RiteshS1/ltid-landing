"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck } from "lucide-react";
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
          scale: 0.94,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".partner-grid", start: "top 82%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="partners" ref={root} className="relative z-10 bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-5">{t("eyebrow")}</p>
        <SplitHeading className="max-w-3xl font-serif text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold">
          {t("title")}
        </SplitHeading>
        <p className="mt-6 max-w-2xl text-base leading-8 text-paper-dim md:text-lg">{t("lead")}</p>

        <div className="partner-grid mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.name} className="partner group bg-ink p-8 transition-colors hover:bg-ink-3 md:p-10">
              <p className="font-display text-2xl font-bold tracking-wide transition-colors group-hover:text-jade md:text-3xl">
                {p.name}
              </p>
              <p className="mt-3 text-sm text-paper-dim">{p.role}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 inline-flex items-center gap-2 text-sm text-jade">
          <BadgeCheck className="h-4 w-4" /> {t("licence")}
        </p>
      </div>
    </section>
  );
}
