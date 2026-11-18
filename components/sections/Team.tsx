"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import SplitHeading from "@/components/ui/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";

type Member = { role: string; name: string; initials: string; bio: string };
const TILE = ["bg-leaf", "bg-sun", "bg-sakura"];

export default function Team() {
  const t = useTranslations("Team");
  const root = useRef<HTMLElement>(null);
  const members = t.raw("members") as Member[];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".member", {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.14,
          scrollTrigger: { trigger: ".member-grid", start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="team" ref={root} className="grain relative z-10 bg-paper-2 py-24 md:py-36">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-6 flex items-center gap-3 text-shu">
          <span className="font-display text-3xl font-extrabold">07</span>
          {t("eyebrow")}
        </p>
        <SplitHeading className="max-w-3xl font-display text-[clamp(2rem,4.8vw,4.2rem)] font-extrabold leading-[1.15]">
          {t("title")}
        </SplitHeading>
        <p className="mt-7 max-w-2xl text-base leading-8 md:text-lg">{t("lead")}</p>

        <div className="member-grid mt-14 grid gap-10 md:mt-20 lg:grid-cols-3 lg:gap-12">
          {members.map((m, i) => (
            <article key={m.name} className="member border-t-4 border-sumi pt-6">
              <span className={`grid h-24 w-24 place-items-center border-2 border-sumi font-display text-3xl font-extrabold print-shadow-sm ${TILE[i]}`}>
                {m.initials}
              </span>
              <h3 className="mt-6 font-display text-2xl font-extrabold">{m.name}</h3>
              <p className="eyebrow mt-1 text-shu">{m.role}</p>
              <p className="mt-5 text-sm leading-7">{m.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
