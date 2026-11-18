"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type Props = {
  as?: "h1" | "h2" | "h3" | "span";
  className?: string;
  children: ReactNode;
  delay?: number;
  /** animate immediately instead of on scroll (hero) */
  immediate?: boolean;
};

/** Masked line-by-line reveal using GSAP SplitText. Respects reduced motion. */
export default function SplitHeading({
  as = "h2",
  className,
  children,
  delay = 0,
  immediate = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 115,
              duration: 1.15,
              ease: "power4.out",
              stagger: 0.09,
              delay,
              scrollTrigger: immediate
                ? undefined
                : { trigger: el, start: "top 88%", once: true },
            });
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
