import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/ui/Header";

export default function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="relative z-10 border-t border-white/10 bg-ink px-5 py-12 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <LogoMark className="h-8 w-8 text-paper" />
          <div>
            <p className="font-display text-lg font-bold tracking-[0.18em]">LTID</p>
            <p className="mt-1 text-sm text-paper-dim">{t("company")}</p>
          </div>
        </div>
        <div className="max-w-xl space-y-3 text-xs leading-6 text-paper-dim/80">
          <p className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-paper-dim">{t("notice")}</p>
          <p>{t("sources")}</p>
        </div>
      </div>
    </footer>
  );
}
