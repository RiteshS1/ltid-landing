"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import SplitHeading from "@/components/ui/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";

type Row = { stat: string; statLabel: string; title: string; body: string };

/** 100 squares = the retail price. 20 solid + 10 hatched = what reaches the farmer. */
function Waffle() {
  return (
    <div className="waffle grid grid-cols-10 gap-1.5 md:gap-2">
      {Array.from({ length: 100 }, (_, i) => (
        <span
          key={i}
          className={`waffle-cell aspect-square ${i < 20 ? "bg-matcha" : i < 30 ? "hatch" : "bg-shu/85"}`}
        />
      ))}
    </div>
  );
}

export default function Problem() {
  const t = useTranslations("Problem");
  const root = useRef<HTMLElement>(null);
  const rows = t.raw("rows") as Row[];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".waffle-cell", {
          scale: 0,
          duration: 0.5,
          ease: "back.out(2)",
          stagger: { each: 0.014, from: "start" },
          scrollTrigger: { trigger: ".waffle", start: "top 80%", once: true },
        });
        gsap.from(".legend-item", {
          opacity: 0,
          x: -20,
          duration: 0.7,
          stagger: 0.15,
          delay: 0.9,
          scrollTrigger: { trigger: ".waffle", start: "top 80%", once: true },
        });
        gsap.from(".problem-row", {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".problem-rows", start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="problem" ref={root} className="grain relative z-10 bg-paper py-24 md:py-36">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-6 flex items-center gap-3 text-shu">
              <span className="font-display text-3xl font-extrabold">01</span>
              {t("eyebrow")}
            </p>
            <SplitHeading className="font-display text-[clamp(1.9rem,4vw,3.6rem)] font-extrabold leading-[1.15]">
              {t("title")}
            </SplitHeading>
            <p className="mt-7 max-w-xl text-base leading-8 md:text-lg">{t("lead")}</p>
          </div>

          <div className="border-2 border-sumi bg-paper-2 p-5 print-shadow md:p-7">
            <p className="mb-4 flex items-baseline justify-between text-xs font-bold uppercase tracking-widest">
              <span>{t("waffleCaption")}</span>
              <span className="font-display text-2xl">100</span>
            </p>
            <Waffle />
            <ul className="mt-5 space-y-2 text-sm font-medium">
              <li className="legend-item flex items-center gap-3">
                <span className="h-4 w-4 shrink-0 bg-matcha" />
                <span className="h-4 w-4 shrink-0 hatch -ml-1" />
                {t("legendFarmer")}
              </li>
              <li className="legend-item flex items-center gap-3">
                <span className="h-4 w-4 shrink-0 bg-shu/85" />
                {t("legendMiddle")}
              </li>
            </ul>
          </div>
        </div>

        <div className="problem-rows mt-20 md:mt-28">
          {rows.map((r) => (
            <div
              key={r.title}
              className="problem-row grid gap-6 border-t-2 border-sumi py-9 transition-colors hover:bg-paper-2 md:grid-cols-[1fr_1.5fr] md:gap-12 md:px-3 md:py-12"
            >
              <div>
                <p className="font-display text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-none text-shu">{r.stat}</p>
                <p className="mt-3 max-w-xs text-xs font-bold uppercase tracking-wider">{r.statLabel}</p>
              </div>
              <div>
                <h3 className="font-display text-2xl font-extrabold md:text-3xl">{r.title}</h3>
                <p className="mt-3 max-w-xl text-base leading-8">{r.body}</p>
              </div>
            </div>
          ))}
          <p className="border-t-2 border-sumi pt-5 text-xs text-sumi/70">{t("source")}</p>
        </div>
      </div>
    </section>
  );
}
