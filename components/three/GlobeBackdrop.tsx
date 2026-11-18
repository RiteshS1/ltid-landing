"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Fixed full-screen 3D backdrop. Falls back to a CSS glow without WebGL. */
export default function GlobeBackdrop() {
  const ok = useSyncExternalStore(
    () => () => {},
    hasWebGL,
    () => false,
  );

  return (
    <div
      id="globe-backdrop"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    >
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_72%_48%,rgb(0_139_139/0.28),transparent_70%)]" />
      {ok ? (
        <div className="absolute inset-0 max-lg:opacity-55">
          <GlobeScene />
        </div>
      ) : null}
    </div>
  );
}
