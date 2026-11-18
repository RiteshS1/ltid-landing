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
      <div className="relative mx-auto h-52 w-52">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(255 255 255 / .1)" strokeWidth="9" />
          <circle className="gauge" cx="60" cy="60" r="50" fill="none" stroke="url(#g1)" strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stopColor="#19d3b5" />
              <stop offset="1" stopColor="#f2b84b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="gauge-num font-display text-5xl font-bold">0</span>
          <span className="text-xs text-paper-dim">{s.scoreLabel}</span>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs text-paper-dim">{s.loanLabel}</p>
        <div className="flex h-28 items-end gap-3">
          {[28, 48, 72, 100].map((h) => (
            <div key={h} className="loan-bar w-full origin-bottom rounded-t-lg bg-gradient-to-t from-teal to-jade" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-xs text-gold">
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
      <p className="mb-3 text-xs text-paper-dim">{s.chartLabel}</p>
      <svg viewBox="0 0 400 150" className="w-full">
        {[30, 70, 110].map((y) => (
          <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgb(255 255 255 / .08)" />
        ))}
        <path className="line-actual" d={actual} fill="none" stroke="#19d3b5" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        <path className="line-pred" d={pred} fill="none" stroke="#f2b84b" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray="0.04 0.03" strokeDashoffset="0" opacity="0" />
        <circle className="line-dot" cx="250" cy="60" r="5" fill="#f2b84b" opacity="0" />
      </svg>
      <div className="mt-3 flex gap-5 text-xs text-paper-dim">
        <span className="flex items-center gap-2"><i className="h-0.5 w-5 bg-jade" />{s.actual}</span>
        <span className="flex items-center gap-2"><i className="h-0.5 w-5 border-t-2 border-dashed border-gold" />{s.predicted}</span>
      </div>
    </div>
  );
}

function RouteVisual({ s }: { s: Step }) {
  return (
    <div>
      <svg viewBox="0 0 400 170" className="w-full">
        <path id="route" d="M30 130 C 110 130, 120 40, 200 70 S 300 130, 370 40" fill="none" stroke="rgb(255 255 255 / .18)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
        <path className="route-line" d="M30 130 C 110 130, 120 40, 200 70 S 300 130, 370 40" fill="none" stroke="#19d3b5" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        <circle cx="30" cy="130" r="8" fill="#f4f1e8" />
        <circle cx="370" cy="40" r="8" fill="#f2b84b" />
        <text x="30" y="156" fill="#b9c7c2" fontSize="11" textAnchor="middle">{s.from}</text>
        <text x="370" y="66" fill="#b9c7c2" fontSize="11" textAnchor="middle">{s.to}</text>
        <g className="truck">
          <rect x="-12" y="-8" width="20" height="14" rx="3" fill="#19d3b5" />
          <rect x="8" y="-4" width="9" height="10" rx="2" fill="#f2b84b" />
          <circle cx="-5" cy="8" r="3" fill="#05191a" stroke="#f4f1e8" strokeWidth="1.5" />
          <circle cx="11" cy="8" r="3" fill="#05191a" stroke="#f4f1e8" strokeWidth="1.5" />
        </g>
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5"><Camera className="h-3.5 w-3.5 text-jade" />{s.photoSend}</span>
        <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5"><Camera className="h-3.5 w-3.5 text-gold" />{s.photoReceive}</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-gold"><Truck className="h-3.5 w-3.5" />{s.chip}</span>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const t = useTranslations("How");
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const steps = t.raw("steps") as Step[];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const animate = {
        credit: () => {
          const num = root.current!.querySelector<HTMLElement>(".gauge-num")!;
          const o = { n: 0 };
          return gsap
            .timeline()
            .to(".gauge", { strokeDashoffset: 0.18, duration: 1.8, ease: "power3.out" })
            .to(o, { n: 82, duration: 1.8, ease: "power3.out", onUpdate: () => { num.textContent = String(Math.round(o.n)); } }, 0)
            .from(".loan-bar", { scaleY: 0, duration: 0.9, ease: "back.out(1.4)", stagger: 0.18 }, 0.2);
        },
        price: () =>
          gsap
            .timeline()
            .to(".line-actual", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" })
            .to(".line-dot", { opacity: 1, duration: 0.3 })
            .to(".line-pred", { opacity: 1, duration: 0.6 }),
        route: () => {
          const truck = root.current!.querySelector(".truck")!;
          gsap.set(truck, { motionPath: { path: "#route", align: "#route", alignOrigin: [0.5, 0.5], start: 0, end: 0 } });
          return gsap
            .timeline()
            .to(".route-line", { strokeDashoffset: 0, duration: 2.4, ease: "none" })
            .to(truck, { motionPath: { path: "#route", align: "#route", alignOrigin: [0.5, 0.5], autoRotate: false }, duration: 2.4, ease: "none" }, 0);
        },
      };

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".how-panel", root.current!);
        const dist = () => track.current!.scrollWidth - window.innerWidth;
        const move = gsap.to(track.current, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: ".how-pin",
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        gsap.set(".gauge-num", { textContent: 0 });
        (["credit", "price", "route"] as const).forEach((k, i) => {
          const tl = animate[k]().pause();
          ScrollTrigger.create({
            trigger: panels[i],
            containerAnimation: move,
            start: "left 65%",
            once: true,
            onEnter: () => tl.play(),
          });
        });
      });

      // stacked layout: animate on enter
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".how-panel", root.current!);
        (["credit", "price", "route"] as const).forEach((k, i) => {
          const tl = animate[k]().pause();
          ScrollTrigger.create({ trigger: panels[i], start: "top 70%", once: true, onEnter: () => tl.play() });
        });
      });

      // reduced motion: show final states
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".gauge", { strokeDashoffset: 0.18 });
        gsap.set(".gauge-num", { textContent: 82 });
        gsap.set(".line-actual", { strokeDashoffset: 0 });
        gsap.set(".line-pred, .line-dot", { opacity: 1 });
        gsap.set(".route-line", { strokeDashoffset: 0 });
        gsap.set(".truck", { x: 370, y: 40 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const visuals = [CreditVisual, PriceVisual, RouteVisual];

  return (
    <section id="how" ref={root} className="relative z-10 bg-ink">
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-28 md:px-8 md:pt-40">
        <p className="eyebrow mb-5">{t("eyebrow")}</p>
        <SplitHeading className="max-w-3xl font-serif text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold">
          {t("title")}
        </SplitHeading>
      </div>

      <div className="how-pin overflow-hidden lg:flex lg:h-svh lg:items-center">
        <div ref={track} className="flex flex-col gap-6 px-5 pb-10 md:px-8 lg:w-max lg:flex-row lg:gap-10 lg:pb-0 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-24">
          {steps.map((s, i) => {
            const V = visuals[i];
            return (
              <article key={s.index} className="how-panel glass shrink-0 rounded-3xl p-8 md:p-10 lg:w-[min(44rem,70vw)]">
                <p className="eyebrow !text-gold">{s.index}</p>
                <h3 className="mt-3 font-serif text-2xl font-bold md:text-3xl">{s.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-paper-dim">{s.body}</p>
                <div className="mt-8 rounded-2xl bg-ink/60 p-6 ring-1 ring-white/5">
                  <V s={s} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <p className="mx-auto max-w-7xl px-5 pb-24 pt-6 text-xs text-paper-dim/70 md:px-8">{t("illustrative")}</p>
    </section>
  );
}
