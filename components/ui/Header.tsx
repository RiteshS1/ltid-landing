"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";

const LINKS = ["problem", "solution", "how", "impact", "roadmap", "team"] as const;

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
      <path d="M16 27V12M16 17c-4 0-7-3-7-7 4 0 7 3 7 7ZM16 20c4 0 7-3 7-7-4 0-7 3-7 7Z" fill="none" stroke="#19d3b5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const t = useTranslations("Nav");
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "border-b border-white/10 bg-ink/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 text-paper" aria-label="LTID">
          <LogoMark />
          <span className="font-display text-lg font-bold tracking-[0.18em]">LTID</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {LINKS.map((k) => (
            <a
              key={k}
              href={`#${k}`}
              className="text-sm text-paper-dim transition-colors hover:text-paper"
            >
              {t(k)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <a
            href="#contact"
            className="hidden rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink transition-transform hover:scale-[1.04] sm:block"
          >
            {t("contact")}
          </a>
        </div>
      </div>
    </header>
  );
}
