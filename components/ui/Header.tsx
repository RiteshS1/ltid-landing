"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";

const LINKS = ["problem", "solution", "how", "impact", "roadmap", "team"] as const;

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#ee4b2b" />
      <path d="M16 25V13M16 18c-3.6 0-6-2.6-6-6 3.6 0 6 2.6 6 6ZM16 21c3.6 0 6-2.6 6-6-3.6 0-6 2.6-6 6Z" fill="none" stroke="#f5efe2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-500 ${
        solid ? "border-b-2 border-sumi bg-paper/92 text-sumi backdrop-blur-md" : "border-b-2 border-transparent text-paper"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5" aria-label="LTID">
          <LogoMark />
          <span className="font-display text-xl font-extrabold tracking-[0.12em]">LTID</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {LINKS.map((k) => (
            <a key={k} href={`#${k}`} className="text-sm font-medium transition-colors hover:text-shu">
              {t(k)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitcher dark={!solid} />
          <a
            href="#contact"
            className="hidden rounded-full bg-shu px-4 py-2 text-sm font-bold text-paper transition-transform hover:scale-[1.05] sm:block"
          >
            {t("contact")}
          </a>
        </div>
      </div>
    </header>
  );
}
