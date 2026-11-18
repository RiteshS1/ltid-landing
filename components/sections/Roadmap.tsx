"use client";

import { useTranslations } from "next-intl";
import SplitHeading from "@/components/ui/SplitHeading";

type Step = { when: string; place: string; body: string };

/** Transparent: the 3D globe shows behind and is steered by GlobeDirector as each step scrolls in. */
export default function Roadmap() {
  const t = useTranslations("Roadmap");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="roadmap" className="relative z-10 text-paper">
      <div className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-36">
        <div className="max-w-xl">
          <p className="eyebrow mb-6 flex items-center gap-3 text-sun">
            <span className="font-display text-3xl font-extrabold">06</span>
            {t("eyebrow")}
          </p>
          <SplitHeading className="font-display text-[clamp(2rem,4.8vw,4.2rem)] font-extrabold leading-[1.15]">
            {t("title")}
          </SplitHeading>
          <p className="mt-7 text-base leading-8 text-paper/85 md:text-lg">{t("lead")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {steps.map((s, i) => (
          <div key={s.when} data-roadmap-step className="flex min-h-[85svh] items-center">
            <div className="max-w-md border-2 border-sumi bg-paper p-8 text-sumi shadow-[8px_8px_0_0_var(--color-sun)] md:p-10">
              <p className="font-display text-sm font-extrabold tracking-[0.3em] text-shu">
                0{i + 1} · {s.when}
              </p>
              <h3 className="mt-4 font-display text-2xl font-extrabold md:text-3xl">{s.place}</h3>
              <p className="mt-4 text-sm leading-7">{s.body}</p>
            </div>
          </div>
        ))}
        <p className="max-w-lg border-l-4 border-sun pb-0 pl-5 text-sm leading-7 text-paper/90">{t("foodLoss")}</p>
        <div className="h-24 md:h-40" />
      </div>
    </section>
  );
}
