import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/ui/Header";

export default function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="relative z-10 border-t-2 border-paper/20 bg-sumi px-5 py-12 text-paper md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <LogoMark className="h-9 w-9" />
          <div>
            <p className="font-display text-xl font-extrabold tracking-[0.12em]">LTID</p>
            <p className="mt-1 text-sm text-paper/70">{t("company")}</p>
          </div>
        </div>
        <div className="max-w-xl space-y-3 text-xs leading-6 text-paper/70">
          <p className="border-2 border-sun/60 p-4 text-paper/85">{t("notice")}</p>
          <p>{t("sources")}</p>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl border-t border-paper/15 pt-6 text-center font-display text-sm font-bold tracking-wide md:text-base">
        {t("credit")} <span aria-hidden="true">🍜</span> by{" "}
        <a
          href="https://riteshh.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sun underline decoration-2 underline-offset-4 transition-colors hover:text-shu"
        >
          Riteshh ↗
        </a>
      </p>
    </footer>
  );
}
