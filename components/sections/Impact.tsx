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
        gsap.from(".impact-card", {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".impact-grid", start: "top 80%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="impact" ref={root} className="relative z-10 overflow-hidden bg-ink-2 py-28 md:py-40">
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[36rem] w-[36rem] rounded-full bg-gold/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-5">{t("eyebrow")}</p>
        <SplitHeading className="max-w-3xl font-serif text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold">
          {t("title")}
        </SplitHeading>
        <p className="mt-6 max-w-2xl text-base leading-8 text-paper-dim md:text-lg">{t("lead")}</p>

        <div className="impact-grid mt-16 grid gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="impact-card glass rounded-3xl p-8">
              <span className="rounded-full bg-jade/15 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-jade">
                {t("achievedLabel")}
              </span>
              <p className="mt-6 font-display text-6xl font-bold md:text-7xl">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-base font-bold">{s.label}</p>
              {s.note && <p className="mt-1 text-sm text-paper-dim">{s.note}</p>}
              <p className="mt-6 border-t border-white/10 pt-3 text-xs text-paper-dim/70">{s.source}</p>
            </div>
          ))}
        </div>

        <div className="impact-grid mt-5 grid gap-5 md:grid-cols-2">
          {targets.map((s) => (
            <div key={s.label} className="impact-card relative rounded-3xl border border-dashed border-gold/40 p-8">
              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-gold">
                {t("targetLabel")}
              </span>
              <p className="mt-6 font-display text-5xl font-bold text-gold md:text-6xl">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-base font-bold">{s.label}</p>
              <p className="mt-6 border-t border-white/10 pt-3 text-xs text-paper-dim/70">{s.source}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-xs leading-6 text-paper-dim/70">{t("disclaimer")}</p>
      </div>
    </section>
  );
}
