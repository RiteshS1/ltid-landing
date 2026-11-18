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

/**
 * Fixed full-screen 3D stage behind the page. Two CSS layers (sunrise sky for
 * the hero, deep matcha night for the roadmap globe) are cross-faded by the
 * GlobeDirector; the canvas itself is transparent.
 */
export default function GlobeBackdrop() {
  const ok = useSyncExternalStore(
    () => () => {},
    hasWebGL,
    () => false,
  );

  return (
    <div id="globe-backdrop" aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div
        id="bg-sky"
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg,#ffeccb 0%,#ffd3a8 42%,#ff9d78 100%)" }}
      />
      <div
        id="bg-night"
        className="absolute inset-0 opacity-0"
        style={{ background: "radial-gradient(70% 70% at 70% 50%,#1f6b43 0%,#14452a 55%,#0b2a1a 100%)" }}
      />
      {ok ? (
        <div className="absolute inset-0 max-lg:opacity-95">
          <GlobeScene />
        </div>
      ) : null}
    </div>
  );
}
