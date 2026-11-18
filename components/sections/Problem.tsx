"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import SplitHeading from "@/components/ui/SplitHeading";
import Counter from "@/components/ui/Counter";
import { gsap, useGSAP } from "@/lib/gsap";

const NODES = 10;

export default function Problem() {
  const t = useTranslations("Problem");
  const root = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const val = { n: 100 };
        const out = root.current!.querySelector<HTMLElement>(".value-out")!;
        const fill = root.current!.querySelector<HTMLElement>(".value-fill")!;
        const coin = root.current!.querySelector<HTMLElement>(".coin")!;
        const nodes = gsap.utils.toArray<HTMLElement>(".mid-node", root.current!);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top top",
            end: "+=160%",
            pin: true,
            scrub: 0.6,
          },
        });
        tl.to(val, {
          n: 25,
          ease: "none",
          duration: 1,
          onUpdate: () => {
            out.textContent = String(Math.round(val.n));
          },
        }, 0)
          .to(fill, { scaleX: 0.25, ease: "none", duration: 1 }, 0)
          .to(coin, { left: "100%", ease: "none", duration: 1 }, 0);
        nodes.forEach((n, i) => {
          const at = (i + 0.5) / NODES;
          tl.to(n, { backgroundColor: "#dc3232", scale: 1.5, boxShadow: "0 0 22px #dc3232", duration: 0.05 }, at - 0.04)
            .to(n, { scale: 1, duration: 0.08 }, at + 0.02);
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.current!.querySelector<HTMLElement>(".value-out")!.textContent = "25";
        gsap.set(".value-fill", { scaleX: 0.25 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="problem" ref={root} className="relative z-10 bg-ink">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-28 md:px-8 md:pt-40">
        <p className="eyebrow mb-5">{t("eyebrow")}</p>
        <SplitHeading className="max-w-4xl font-serif text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold">
          {t("title")}
        </SplitHeading>
        <p className="mt-6 max-w-2xl text-base leading-8 text-paper-dim md:text-lg">{t("lead")}</p>
      </div>

      {/* pinned value-drain visual */}
      <div ref={pinRef} className="relative flex min-h-svh items-center px-5 md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow !text-paper-dim">{t("chainRetailer")}</p>
              <p className="font-display text-5xl font-bold md:text-7xl">100</p>
            </div>
            <div className="text-right">
              <p className="eyebrow !text-gold">{t("chainFarmer")}</p>
              <p className="font-display text-6xl font-bold text-gold md:text-8xl">
                <span className="value-out">100</span>
                <span className="ml-1 text-xl text-paper-dim md:text-2xl">/ 100</span>
              </p>
            </div>
          </div>

          {/* chain */}
          <div className="relative py-10">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/15" />
            <div className="relative flex items-center justify-between">
              <span className="h-5 w-5 rounded-full bg-paper" />
              {Array.from({ length: NODES }).map((_, i) => (
                <span key={i} className="mid-node h-3 w-3 rounded-full bg-white/25 md:h-4 md:w-4" />
              ))}
              <span className="h-5 w-5 rounded-full bg-gold" />
            </div>
            <span
              className="coin absolute top-1/2 left-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_30px_#f2b84b]"
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-center text-sm text-alert">{t("chainMiddle")}</p>

          <div className="mt-10">
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className="value-fill h-full origin-left rounded-full bg-gradient-to-r from-teal to-gold" />
            </div>
            <p className="mt-3 text-right font-display text-xs tracking-widest text-paper-dim">
              {t("perHundred")}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-28 pt-16 md:px-8 md:pb-40">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="glass relative overflow-hidden rounded-3xl p-8 md:p-10">
            <p className="text-sm text-paper-dim">{t("aprLabel")}</p>
            <p className="mt-3 font-display text-6xl font-bold text-alert md:text-8xl">
              <Counter value={300} suffix="%" />
            </p>
            <p className="mt-1 font-display text-sm text-paper-dim">200–300% APR</p>
            <p className="mt-6 max-w-md text-sm leading-7 text-paper-dim">{t("aprNote")}</p>
          </div>
          <ul className="space-y-5">
            {(t.raw("points") as { title: string; body: string }[]).map((p, i) => (
              <li key={p.title} className="flex gap-5 border-t border-white/10 pt-5">
                <span className="font-display text-sm text-jade">0{i + 1}</span>
                <div>
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-7 text-paper-dim">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-12 text-xs text-paper-dim/70">{t("source")}</p>
      </div>
    </section>
  );
}
