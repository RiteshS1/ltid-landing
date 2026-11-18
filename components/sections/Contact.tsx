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
    "w-full border-0 border-b-2 border-paper/40 bg-transparent px-0 py-3 text-base text-paper placeholder:text-paper/30 focus:border-sun focus:outline-none";

  return (
    <section id="contact" className="relative z-10 overflow-hidden bg-sumi py-24 text-paper md:py-36">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow mb-6 flex items-center gap-3 text-sun">
          <span className="font-display text-3xl font-extrabold">08</span>
          {t("eyebrow")}
        </p>
        <SplitHeading className="max-w-3xl font-display text-[clamp(2rem,4.8vw,4.2rem)] font-extrabold leading-[1.15]">
          {t("title")}
        </SplitHeading>

        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="eyebrow text-sun">{t("visionLabel")}</p>
            <blockquote className="relative mt-12 font-serif text-xl leading-10 md:text-2xl md:leading-[2.6rem]">
              <span aria-hidden="true" className="absolute -left-1 -top-8 font-display text-7xl leading-none text-shu">“</span>
              {t("vision")}
            </blockquote>
            <dl className="mt-10 space-y-5 text-sm">
              <div className="flex gap-4">
                <dt className="mt-0.5 text-sun"><MapPin className="h-5 w-5" /><span className="sr-only">{t("addressLabel")}</span></dt>
                <dd className="text-paper/80">{t("address")}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="mt-0.5 text-sun"><Mail className="h-5 w-5" /><span className="sr-only">{t("emailLabel")}</span></dt>
                <dd><a className="underline decoration-sun underline-offset-4" href={`mailto:${t("email")}`}>{t("email")}</a></dd>
              </div>
              <div className="flex gap-4">
                <dt className="mt-0.5 text-sun"><Globe className="h-5 w-5" /><span className="sr-only">Web</span></dt>
                <dd><a className="underline decoration-sun underline-offset-4" href="https://www.ltid.jp" target="_blank" rel="noopener noreferrer">{t("web")}</a></dd>
              </div>
            </dl>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-7">
            {([
              ["name", "text"],
              ["email", "email"],
              ["subject", "text"],
            ] as const).map(([k, type]) => (
              <div key={k}>
                <label htmlFor={k} className="block text-xs font-bold uppercase tracking-widest text-paper/70">{t(`form.${k}`)}</label>
                <input id={k} name={k} type={type} className={field} aria-invalid={!!errors[k as keyof Errors]} autoComplete={k === "email" ? "email" : k === "name" ? "name" : "off"} />
                {errors[k as keyof Errors] && <p className="mt-1 text-xs text-shu" role="alert">{errors[k as keyof Errors]}</p>}
              </div>
            ))}
            <div>
              <label htmlFor="message" className="block text-xs font-bold uppercase tracking-widest text-paper/70">{t("form.message")}</label>
              <textarea id="message" name="message" rows={4} className={field} aria-invalid={!!errors.message} />
              {errors.message && <p className="mt-1 text-xs text-shu" role="alert">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={state === "sending"}
              className="rounded-full bg-sun px-9 py-4 text-sm font-extrabold text-sumi transition-colors hover:bg-shu hover:text-paper disabled:opacity-60"
            >
              {state === "sending" ? t("form.sending") : t("form.submit")}
            </button>
            {state === "done" && <p className="text-sm text-sun" role="status">{t("form.success")}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
