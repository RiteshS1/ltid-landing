"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Landmark, Network, BrainCircuit } from "lucide-react";
import SplitHeading from "@/components/ui/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";

const ICONS = [Landmark, Network, BrainCircuit];

export default function Solution() {
  const t = useTranslations("Solution");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".pillar", {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: ".pillars", start: "top 80%", once: true },
        });
        gsap.fromTo(
          ".connector",
          { scaleX: 0 },
          { scaleX: 1, ease: "none", transformOrigin: "left", scrollTrigger: { trigger: ".pillars", start: "top 75%", end: "bottom 60%", scrub: true } },
        );
      });
      // pointer tilt (fine pointers only)
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".pillar");
        const cleanups = cards.map((card) => {
          const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
          const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
          const move = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            ry(x * 10);
            rx(-y * 10);
            card.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
            card.style.setProperty("--my", `${(y + 0.5) * 100}%`);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          card.addEventListener("pointermove", move);
          card.addEventListener("pointerleave", leave);
          return () => {
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerleave", leave);
          };
        });
        return () => cleanups.forEach((c) => c());
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const pillars = t.raw("pillars") as { tag: string; title: string; body: string }[];

  return (
    <section id="solution" ref={root} className="relative z-10 overflow-hidden bg-ink-2 py-28 md:py-40">
      <div className="pointer-events-none absolute -right-40 top-0 h-[40rem] w-[40rem] rounded-full bg-teal/20 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-5">{t("eyebrow")}</p>
        <SplitHeading className="max-w-4xl font-serif text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold">
          {t("title")}
        </SplitHeading>
        <p className="mt-6 max-w-2xl text-base leading-8 text-paper-dim md:text-lg">{t("lead")}</p>

        <div className="pillars relative mt-16 [perspective:1200px]">
          <div className="connector absolute left-0 right-0 top-[3.1rem] hidden h-px bg-gradient-to-r from-jade via-teal to-gold lg:block" />
          <div className="grid gap-6 lg:grid-cols-3">
            {pillars.map((p, i) => {
              const Icon = ICONS[i];
              return (
                <article
                  key={p.tag}
                  className="pillar glass relative overflow-hidden rounded-3xl p-8 [transform-style:preserve-3d] before:absolute before:inset-0 before:bg-[radial-gradient(300px_circle_at_var(--mx,50%)_var(--my,0%),rgb(25_211_181/0.16),transparent_60%)] before:opacity-0 before:transition-opacity hover:before:opacity-100"
                >
                  <div className="relative">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-jade/15 text-jade ring-1 ring-jade/30">
                      <Icon className="h-6 w-6" />
                    </span>
                    <p className="eyebrow mt-8 !text-gold">{p.tag}</p>
                    <h3 className="mt-3 text-2xl font-bold">{p.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-paper-dim">{p.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <p className="mt-10 text-xs tracking-wide text-jade/80">◆ {t("patent")}</p>
      </div>
    </section>
  );
}
