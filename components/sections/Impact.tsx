"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import SplitHeading from "@/components/ui/SplitHeading";
import Counter from "@/components/ui/Counter";
import { gsap, useGSAP } from "@/lib/gsap";

type Stat = { value: number; prefix?: string; suffix?: string; label: string; note?: string; source: string };

export default function Impact() {
  const t = useTranslations("Impact");
  const root = useRef<HTMLElement>(null);
  const stats = t.raw("stats") as Stat[];
  const targets = t.raw("targets") as Stat[];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".impact-item", {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".impact-grid", start: "top 82%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="impact" ref={root} className="grain relative z-10 overflow-hidden bg-shu py-24 text-sumi md:py-36">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="font-display text-3xl font-extrabold text-paper">04</span>
          {t("eyebrow")}
        </p>
        <SplitHeading className="max-w-3xl font-display text-[clamp(2rem,4.8vw,4.2rem)] font-extrabold leading-[1.15]">
          {t("title")}
        </SplitHeading>
        <p className="mt-7 max-w-2xl text-base font-medium leading-8 md:text-lg">{t("lead")}</p>

        <div className="impact-grid mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="impact-item border-t-4 border-sumi pt-4">
              <span className="inline-block bg-sumi px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-paper">
                {t("achievedLabel")}
              </span>
              <p className="mt-4 font-display text-[clamp(4.2rem,9vw,7.5rem)] font-extrabold leading-none text-paper">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-lg font-bold">{s.label}</p>
              {s.note && <p className="text-sm font-medium">{s.note}</p>}
              <p className="mt-4 text-xs font-medium opacity-80">{s.source}</p>
            </div>
          ))}
        </div>

        <div className="impact-grid mt-16 grid gap-6 md:grid-cols-2">
          {targets.map((s) => (
            <div key={s.label} className="impact-item bg-sumi p-8 text-paper print-shadow-paper">
              <span className="inline-block bg-sun px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-sumi">
                {t("targetLabel")}
              </span>
              <p className="mt-4 font-display text-[clamp(3rem,6vw,5rem)] font-extrabold leading-none text-sun">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-base font-bold">{s.label}</p>
              <p className="mt-3 text-xs text-paper/70">{s.source}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-xs font-medium leading-6">{t("disclaimer")}</p>
      </div>
    </section>
  );
}
