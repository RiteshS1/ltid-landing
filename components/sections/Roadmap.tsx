"use client";

import { useTranslations } from "next-intl";
import SplitHeading from "@/components/ui/SplitHeading";

type Step = { when: string; place: string; body: string };

/** Transparent section: the persistent 3D globe shows behind and is steered by GlobeDirector. */
export default function Roadmap() {
  const t = useTranslations("Roadmap");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="roadmap" className="relative z-10">
      <div className="mx-auto max-w-7xl px-5 pt-28 md:px-8 md:pt-40">
        <div className="max-w-xl rounded-3xl bg-ink/55 p-1 backdrop-blur-[2px]">
          <p className="eyebrow mb-5">{t("eyebrow")}</p>
          <SplitHeading className="font-serif text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold">
            {t("title")}
          </SplitHeading>
          <p className="mt-6 text-base leading-8 text-paper-dim md:text-lg">{t("lead")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {steps.map((s, i) => (
          <div key={s.when} data-roadmap-step className="flex min-h-[85svh] items-center">
            <div className="glass max-w-md rounded-3xl bg-ink/70 p-8 md:p-10">
              <p className="font-display text-sm font-bold tracking-[0.3em] text-gold">
                0{i + 1} · {s.when}
              </p>
              <h3 className="mt-4 font-serif text-2xl font-bold md:text-3xl">{s.place}</h3>
              <p className="mt-4 text-sm leading-7 text-paper-dim">{s.body}</p>
            </div>
          </div>
        ))}
        <p className="max-w-lg pb-28 text-sm leading-7 text-paper-dim md:pb-40">
          <span className="rounded-xl bg-ink/70 px-1 py-1">{t("foodLoss")}</span>
        </p>
      </div>
    </section>
  );
}
