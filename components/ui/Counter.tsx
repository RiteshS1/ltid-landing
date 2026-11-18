"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
};

/** Counts up when scrolled into view; renders the final value immediately for reduced motion. */
export default function Counter({ value, prefix = "", suffix = "", decimals, className }: Props) {
  const locale = useLocale();
  const ref = useRef<HTMLSpanElement>(null);
  const d = decimals ?? (Number.isInteger(value) ? 0 : 1);
  const fmt = (n: number) =>
    prefix +
    new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(n) +
    suffix;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const o = { n: 0 };
        el.textContent = fmt(0);
        gsap.to(o, {
          n: value,
          duration: 2,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = fmt(o.n);
          },
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [value, locale] },
  );

  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  );
}
