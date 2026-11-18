"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Mail, MapPin, Globe } from "lucide-react";
import SplitHeading from "@/components/ui/SplitHeading";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export default function Contact() {
  const t = useTranslations("Contact");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const next: Errors = {};
    if (!String(f.get("name") ?? "").trim()) next.name = t("form.required");
    const email = String(f.get("email") ?? "").trim();
    if (!email) next.email = t("form.required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t("form.invalidEmail");
    if (!String(f.get("message") ?? "").trim()) next.message = t("form.required");
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("sending");
    // MVP demo: no backend. Simulate a send.
    setTimeout(() => setState("done"), 900);
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-sm text-paper placeholder:text-paper-dim/50 focus:border-jade focus:outline-none";

  return (
    <section id="contact" className="relative z-10 overflow-hidden bg-ink py-28 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-teal/20 blur-[160px]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-5">{t("eyebrow")}</p>
        <SplitHeading className="max-w-3xl font-serif text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold">
          {t("title")}
        </SplitHeading>

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow !text-gold">{t("visionLabel")}</p>
            <blockquote className="mt-4 border-l-2 border-jade pl-6 font-serif text-lg leading-9 text-paper md:text-xl">
              {t("vision")}
            </blockquote>
            <dl className="mt-10 space-y-5 text-sm">
              <div className="flex gap-4">
                <dt className="mt-0.5 text-jade"><MapPin className="h-5 w-5" /><span className="sr-only">{t("addressLabel")}</span></dt>
                <dd className="text-paper-dim">{t("address")}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="mt-0.5 text-jade"><Mail className="h-5 w-5" /><span className="sr-only">{t("emailLabel")}</span></dt>
                <dd><a className="text-paper underline decoration-jade/50 underline-offset-4" href={`mailto:${t("email")}`}>{t("email")}</a></dd>
              </div>
              <div className="flex gap-4">
                <dt className="mt-0.5 text-jade"><Globe className="h-5 w-5" /><span className="sr-only">Web</span></dt>
                <dd><a className="text-paper underline decoration-jade/50 underline-offset-4" href="https://www.ltid.jp" target="_blank" rel="noopener noreferrer">{t("web")}</a></dd>
              </div>
            </dl>
          </div>

          <form onSubmit={onSubmit} noValidate className="glass space-y-5 rounded-3xl p-8 md:p-10">
            {([
              ["name", "text"],
              ["email", "email"],
              ["subject", "text"],
            ] as const).map(([k, type]) => (
              <div key={k}>
                <label htmlFor={k} className="mb-2 block text-xs text-paper-dim">{t(`form.${k}`)}</label>
                <input id={k} name={k} type={type} className={field} aria-invalid={!!errors[k as keyof Errors]} autoComplete={k === "email" ? "email" : k === "name" ? "name" : "off"} />
                {errors[k as keyof Errors] && <p className="mt-1 text-xs text-alert" role="alert">{errors[k as keyof Errors]}</p>}
              </div>
            ))}
            <div>
              <label htmlFor="message" className="mb-2 block text-xs text-paper-dim">{t("form.message")}</label>
              <textarea id="message" name="message" rows={5} className={field} aria-invalid={!!errors.message} />
              {errors.message && <p className="mt-1 text-xs text-alert" role="alert">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={state === "sending"}
              className="w-full rounded-full bg-jade px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {state === "sending" ? t("form.sending") : t("form.submit")}
            </button>
            {state === "done" && <p className="text-sm text-jade" role="status">{t("form.success")}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
