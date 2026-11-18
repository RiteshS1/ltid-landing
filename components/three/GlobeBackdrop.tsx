"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Fixed full-screen night stage behind the hero and roadmap: graded background,
 * warm glow behind the globe, the WebGL canvas, then vignette + film grain on top.
 */
export default function GlobeBackdrop() {
  const t = useTranslations("Globe");
  const ok = useSyncExternalStore(
    () => () => {},
    hasWebGL,
    () => false,
  );
  const labels: { key: string; hub?: boolean; region?: boolean }[] = [
    { key: "tokyo", hub: true },
    { key: "benguet", hub: true },
    { key: "india" },
    { key: "mozambique" },
    { key: "sea", region: true },
  ];

  return (
    <div
      id="globe-backdrop"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: "radial-gradient(130% 100% at 70% 40%, #12382a 0%, #0a2118 38%, #06120d 72%, #030806 100%)" }}
    >
      {/* warm sunrise glow behind the globe */}
      <div className="absolute inset-0 hidden lg:block" style={{ background: "radial-gradient(30% 44% at 76% 50%, rgb(238 75 43 / 0.26), rgb(255 176 32 / 0.06) 55%, transparent 75%)" }} />
      <div className="absolute inset-0 lg:hidden" style={{ background: "radial-gradient(60% 34% at 50% 78%, rgb(238 75 43 / 0.26), transparent 75%)" }} />
      {ok ? <GlobeScene /> : null}
      {ok && (
        <div className="absolute inset-0">
          {labels.map((l) => (
            <div
              key={l.key}
              data-globe-label={l.key}
              data-hub={l.hub ? "true" : undefined}
              className={`globe-label absolute left-0 top-0 opacity-0 ${l.region ? "globe-label--region" : ""}`}
            >
              {t(l.key)}
            </div>
          ))}
        </div>
      )}
      {/* colour grade: cool shadows, vignette, grain */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(3 8 6 / 0.55) 0%, transparent 22%, transparent 70%, rgb(3 8 6 / 0.6) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgb(0 0 0 / 0.55) 100%)" }} />
      {/* mobile: keep copy legible over the rising globe */}
      <div className="absolute inset-0 lg:hidden" style={{ background: "linear-gradient(180deg, rgb(3 8 6 / 0.2) 0%, rgb(3 8 6 / 0.55) 55%, rgb(3 8 6 / 0.1) 85%)" }} />
      <div className="film-grain absolute inset-0" />
    </div>
  );
}
