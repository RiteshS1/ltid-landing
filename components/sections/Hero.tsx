"use client";

import { useRef, type PointerEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import SplitHeading from "@/components/ui/SplitHeading";
import Marquee from "@/components/ui/Marquee";
import { gsap, useGSAP } from "@/lib/gsap";
import { globeState } from "@/lib/globeState";

export default function Hero() {
  const t = useTranslations("Hero");
  const root = useRef<HTMLElement>(null);
  const lastX = useRef(0);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-fade", { opacity: 0, y: 24, duration: 1.1, ease: "power3.out", stagger: 0.1, delay: 0.7 });
      });
    },
    { scope: root },
  );

  // drag the globe (desktop zone to the right of the copy)
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    globeState.dragging = true;
    globeState.spinVel = 0;
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!globeState.dragging) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    globeState.spin -= dx * 0.25;
    globeState.spinVel = -dx * 0.25;
  };
  const onUp = () => {
    globeState.dragging = false;
  };

  return (
    <section id="top" ref={root} className="relative z-10 flex min-h-svh flex-col text-paper">
      <div
        aria-hidden="true"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute inset-y-0 right-0 hidden w-[48%] cursor-grab touch-pan-y active:cursor-grabbing lg:block"
      />
      <div className="pointer-events-none flex flex-1 items-start px-5 pb-16 pt-24 md:items-center md:px-8 md:pt-28">
        <div className="pointer-events-auto mx-auto w-full max-w-7xl">
          <div className="max-w-2xl">
            <p className="hero-fade mb-7 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center bg-shu font-serif text-base font-bold text-paper">農</span>
              <span className="eyebrow text-paper/80">{t("eyebrow")}</span>
            </p>
            <h1 className="font-display text-[clamp(2.3rem,5vw,4.7rem)] font-extrabold leading-[1.08] tracking-tight">
              <SplitHeading as="span" immediate delay={0.2} className="block pb-1">
                {t("titleLine1")}
              </SplitHeading>
              <SplitHeading as="span" immediate delay={0.4} className="block pb-2 text-sun">
                {t("titleLine2")}
              </SplitHeading>
            </h1>
            <p className="hero-fade mt-6 max-w-xl text-base leading-8 text-paper/80 md:text-lg">{t("subtitle")}</p>
            <div className="hero-fade mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#problem"
                className="group inline-flex items-center gap-2 border-2 border-sumi bg-sun px-7 py-3.5 text-sm font-extrabold text-sumi shadow-[5px_5px_0_0_var(--color-shu)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                {t("ctaPrimary")}
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
              <a
                href="#contact"
                className="border-2 border-paper/80 px-7 py-3 text-sm font-bold text-paper transition-colors hover:bg-paper hover:text-sumi"
              >
                {t("ctaSecondary")}
              </a>
            </div>
            <ul className="hero-fade mt-10 hidden flex-wrap gap-2 sm:flex">
              {(t.raw("tags") as string[]).map((tag) => (
                <li key={tag} className="border border-paper/35 px-3 py-1 text-xs font-bold tracking-wide text-paper/75">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Marquee text={t("marquee")} className="relative border-y-2 border-sumi bg-sun py-3 text-sumi" />
    </section>
  );
}
