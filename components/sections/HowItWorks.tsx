"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Camera, Truck, Zap } from "lucide-react";
import SplitHeading from "@/components/ui/SplitHeading";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type Step = Record<string, string>;

function CreditVisual({ s }: { s: Step }) {
  return (
    <div className="grid items-center gap-8 sm:grid-cols-2">
      <div className="relative mx-auto h-48 w-48">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(23 20 15 / .1)" strokeWidth="11" />
          <circle className="gauge" cx="60" cy="60" r="50" fill="none" stroke="url(#g1)" strokeWidth="11" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stopColor="#ee4b2b" />
              <stop offset="1" stopColor="#ffb020" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="gauge-num font-display text-5xl font-extrabold">0</span>
          <span className="text-xs font-bold">{s.scoreLabel}</span>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-bold">{s.loanLabel}</p>
        <div className="flex h-28 items-end gap-3">
          {[28, 48, 72, 100].map((h) => (
            <div key={h} className="loan-bar w-full origin-bottom border-2 border-sumi bg-leaf" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="mt-4 inline-flex items-center gap-2 bg-sun px-3 py-1.5 text-xs font-bold">
          <Zap className="h-3.5 w-3.5" /> {s.chip}
        </p>
      </div>
    </div>
  );
}

function PriceVisual({ s }: { s: Step }) {
  const actual = "M0 120 C 30 110, 50 130, 80 100 S 130 70, 160 85 S 215 50, 250 60";
  const pred = "M250 60 C 280 50, 300 70, 330 40 S 380 30, 400 20";
  return (
    <div>
      <p className="mb-3 text-xs font-bold">{s.chartLabel}</p>
      <svg viewBox="0 0 400 150" className="w-full">
        {[30, 70, 110].map((y) => (
          <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgb(23 20 15 / .12)" />
        ))}
        <path className="line-actual" d={actual} fill="none" stroke="#1c5a38" strokeWidth="4" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        <path className="line-pred" d={pred} fill="none" stroke="#ee4b2b" strokeWidth="4" strokeLinecap="round" pathLength={1} strokeDasharray="0.04 0.03" opacity="0" />
        <circle className="line-dot" cx="250" cy="60" r="6" fill="#ffb020" stroke="#17140f" strokeWidth="2" opacity="0" />
      </svg>
      <div className="mt-3 flex gap-5 text-xs font-bold">
        <span className="flex items-center gap-2"><i className="h-1 w-5 bg-matcha" />{s.actual}</span>
        <span className="flex items-center gap-2"><i className="h-0 w-5 border-t-4 border-dashed border-shu" />{s.predicted}</span>
      </div>
    </div>
  );
}

function RouteVisual({ s }: { s: Step }) {
  const d = "M30 130 C 110 130, 120 40, 200 70 S 300 130, 370 40";
  return (
    <div>
      <svg viewBox="0 0 400 170" className="w-full">
        <path id="route" d={d} fill="none" stroke="rgb(23 20 15 / .25)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
        <path className="route-line" d={d} fill="none" stroke="#ee4b2b" strokeWidth="4" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        <circle cx="30" cy="130" r="8" fill="#17140f" />
        <circle cx="370" cy="40" r="8" fill="#ee4b2b" stroke="#17140f" strokeWidth="2" />
        <text x="30" y="156" fill="#17140f" fontSize="11" fontWeight="700" textAnchor="middle">{s.from}</text>
        <text x="370" y="66" fill="#17140f" fontSize="11" fontWeight="700" textAnchor="middle">{s.to}</text>
        <g className="truck">
          <rect x="-12" y="-8" width="20" height="14" rx="2" fill="#1c5a38" stroke="#17140f" strokeWidth="1.5" />
          <rect x="8" y="-4" width="9" height="10" rx="2" fill="#ffb020" stroke="#17140f" strokeWidth="1.5" />
          <circle cx="-5" cy="8" r="3" fill="#f5efe2" stroke="#17140f" strokeWidth="1.5" />
          <circle cx="11" cy="8" r="3" fill="#f5efe2" stroke="#17140f" strokeWidth="1.5" />
        </g>
      </svg>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
        <span className="inline-flex items-center gap-2 border-2 border-sumi px-3 py-1.5"><Camera className="h-3.5 w-3.5" />{s.photoSend}</span>
        <span className="inline-flex items-center gap-2 border-2 border-sumi px-3 py-1.5"><Camera className="h-3.5 w-3.5" />{s.photoReceive}</span>
        <span className="inline-flex items-center gap-2 bg-sun px-3 py-1.5"><Truck className="h-3.5 w-3.5" />{s.chip}</span>
      </div>
    </div>
  );
}

const VISUALS = [CreditVisual, PriceVisual, RouteVisual];

export default function HowItWorks() {
  const t = useTranslations("How");
  const root = useRef<HTMLElement>(null);
  const steps = t.raw("steps") as Step[];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = <T extends Element>(sel: string) => root.current!.querySelector<T>(sel)!;

      const builders = [
        () => {
          const num = q<HTMLElement>(".gauge-num");
          const o = { n: 0 };
          return gsap
            .timeline()
            .to(".gauge", { strokeDashoffset: 0.18, duration: 1.8, ease: "power3.out" })
            .to(o, { n: 82, duration: 1.8, ease: "power3.out", onUpdate: () => { num.textContent = String(Math.round(o.n)); } }, 0)
            .from(".loan-bar", { scaleY: 0, duration: 0.9, ease: "back.out(1.4)", stagger: 0.18 }, 0.2);
        },
        () =>
          gsap
            .timeline()
            .to(".line-actual", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" })
            .to(".line-dot", { opacity: 1, duration: 0.3 })
            .to(".line-pred", { opacity: 1, duration: 0.6 }),
        () => {
          const truck = q(".truck");
          gsap.set(truck, { motionPath: { path: "#route", align: "#route", alignOrigin: [0.5, 0.5], start: 0, end: 0 } });
          return gsap
            .timeline()
            .to(".route-line", { strokeDashoffset: 0, duration: 2.4, ease: "none" })
            .to(truck, { motionPath: { path: "#route", align: "#route", alignOrigin: [0.5, 0.5] }, duration: 2.4, ease: "none" }, 0);
        },
      ];

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".how-visual", root.current!);
        builders.forEach((build, i) => {
          const tl = build().pause();
          ScrollTrigger.create({ trigger: panels[i], start: "top 75%", once: true, onEnter: () => tl.play() });
        });
        gsap.from(".how-text", {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".how-steps", start: "top 85%", once: true },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".gauge", { strokeDashoffset: 0.18 });
        gsap.set(".gauge-num", { textContent: 82 });
        gsap.set(".line-actual", { strokeDashoffset: 0 });
        gsap.set(".line-pred, .line-dot", { opacity: 1 });
        gsap.set(".route-line", { strokeDashoffset: 0 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="how" ref={root} className="grain relative z-10 bg-paper-2 py-24 md:py-36">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-6 flex items-center gap-3 text-shu">
          <span className="font-display text-3xl font-extrabold">03</span>
          {t("eyebrow")}
        </p>
        <SplitHeading className="max-w-3xl font-display text-[clamp(2rem,4.8vw,4.2rem)] font-extrabold leading-[1.15]">
          {t("title")}
        </SplitHeading>

        <div className="how-steps mt-16 md:mt-24">
          {steps.map((s, i) => {
            const V = VISUALS[i];
            return (
              <article key={s.index} className="grid items-center gap-10 border-t-2 border-sumi py-12 md:py-16 lg:grid-cols-2 lg:gap-20">
                <div className={`how-text ${i % 2 ? "lg:order-2" : ""}`}>
                  <p className="font-display text-[clamp(4rem,9vw,7rem)] font-extrabold leading-none text-shu">0{i + 1}</p>
                  <h3 className="mt-4 font-display text-2xl font-extrabold md:text-4xl">{s.title}</h3>
                  <p className="mt-4 max-w-lg text-base leading-8">{s.body}</p>
                </div>
                <div className={`how-visual border-2 border-sumi bg-paper print-shadow ${i % 2 ? "lg:order-1" : ""}`}>
                  <div className="flex items-center gap-1.5 border-b-2 border-sumi bg-sumi px-3 py-2">
                    <i className="h-2.5 w-2.5 rounded-full bg-shu" />
                    <i className="h-2.5 w-2.5 rounded-full bg-sun" />
                    <i className="h-2.5 w-2.5 rounded-full bg-leaf" />
                    <span className="ml-2 font-display text-[0.7rem] font-bold uppercase tracking-widest text-paper/70">{s.index}</span>
                  </div>
                  <div className="p-6 md:p-8">
                    <V s={s} />
                  </div>
                </div>
              </article>
            );
          })}
          <p className="border-t-2 border-sumi pt-5 text-xs text-sumi/70">{t("illustrative")}</p>
        </div>
      </div>
    </section>
  );
}
