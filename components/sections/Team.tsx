"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import SplitHeading from "@/components/ui/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";

type Member = { role: string; name: string; initials: string; bio: string };

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
          scrollTrigger: { trigger: ".member-grid", start: "top 82%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="team" ref={root} className="relative z-10 bg-ink-2 py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-5">{t("eyebrow")}</p>
        <SplitHeading className="max-w-3xl font-serif text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold">
          {t("title")}
        </SplitHeading>
        <p className="mt-6 max-w-2xl text-base leading-8 text-paper-dim md:text-lg">{t("lead")}</p>

        <div className="member-grid mt-14 grid gap-6 lg:grid-cols-3">
          {members.map((m) => (
            <article key={m.name} className="member glass rounded-3xl p-8">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal to-jade font-display text-xl font-bold text-ink">
                  {m.initials}
                </span>
                <div>
                  <h3 className="text-xl font-bold">{m.name}</h3>
                  <p className="text-sm text-gold">{m.role}</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-paper-dim">{m.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
