"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import SplitHeading from "@/components/ui/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";

type Pillar = { tag: string; title: string; body: string; big: string };

export default function Solution() {
  const t = useTranslations("Solution");
  const root = useRef<HTMLElement>(null);
  const pillars = t.raw("pillars") as Pillar[];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".pillar", {
          opacity: 0,
          y: 60,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.14,
          scrollTrigger: { trigger: ".pillars", start: "top 82%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="solution" ref={root} className="relative z-10 overflow-hidden bg-matcha py-24 text-paper md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-6 flex items-center gap-3 text-sun">
          <span className="font-display text-3xl font-extrabold">02</span>
          {t("eyebrow")}
        </p>
        <SplitHeading className="max-w-4xl font-display text-[clamp(2rem,4.8vw,4.2rem)] font-extrabold leading-[1.15]">
          {t("title")}
        </SplitHeading>
        <p className="mt-7 max-w-2xl text-base leading-8 text-paper/85 md:text-lg">{t("lead")}</p>
      </div>

      <div className="pillars mx-auto mt-16 max-w-7xl border-y-2 border-paper/80 md:mt-20 lg:grid lg:grid-cols-3">
        {pillars.map((p, i) => (
          <article
            key={p.tag}
            className={`pillar group relative cursor-default overflow-hidden px-6 py-10 transition-colors duration-500 hover:bg-leaf hover:text-sumi md:px-10 md:py-14 ${
              i ? "border-t-2 border-paper/80 lg:border-l-2 lg:border-t-0" : ""
            }`}
          >
            <p className="font-display text-[clamp(3.6rem,8vw,6.5rem)] font-extrabold leading-none text-leaf transition-colors duration-500 group-hover:text-sumi">
              {p.big}
            </p>
            <p className="eyebrow mt-8 text-sun transition-colors group-hover:text-shu">{p.tag}</p>
            <h3 className="mt-3 font-display text-2xl font-extrabold md:text-3xl">{p.title}</h3>
            <p className="mt-4 text-sm leading-7 opacity-90 md:text-base md:leading-8">{p.body}</p>
          </article>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-7xl px-5 text-sm font-bold text-sun md:px-8">
        <span className="mr-2 inline-block rotate-[-3deg] border-2 border-sun px-2 py-0.5">{t("stamp")}</span>
        {t("patent")}
      </p>
    </section>
  );
}
