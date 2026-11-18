"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABEL: Record<string, string> = { ja: "日本語", en: "EN" };

/** Switches language without changing the URL (locale is stored in a cookie). */
export default function LocaleSwitcher() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  return (
    <div role="group" aria-label={t("language")} className="flex items-center rounded-full border-2 border-sumi p-0.5 text-xs">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          disabled={pending}
          onClick={() => start(() => router.replace(pathname, { locale: l, scroll: false }))}
          className={`rounded-full px-3 py-1.5 font-semibold transition-colors ${
            l === locale ? "bg-sumi text-paper" : "text-sumi hover:bg-sumi/10"
          }`}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
