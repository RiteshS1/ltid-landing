"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABEL: Record<string, string> = { ja: "日本語", en: "EN" };

export default function LocaleSwitcher() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="glass flex items-center rounded-full p-0.5 text-xs"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          disabled={pending}
          onClick={() => start(() => router.replace(pathname, { locale: l, scroll: false }))}
          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
            l === locale ? "bg-jade text-ink" : "text-paper-dim hover:text-paper"
          }`}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
