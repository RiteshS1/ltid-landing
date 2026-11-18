"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { globeState } from "@/lib/globeState";

const HERO = { lon: 112, lat: 16, zoom: 1 };
const STEPS = [
  { lon: 124, lat: 20, zoom: 1.35 }, // Philippines
  { lon: 108, lat: 8, zoom: 1.12 }, // Southeast Asia
  { lon: 78, lat: 2, zoom: 0.95 }, // India → Africa
];

const go = (v: { lon: number; lat: number; zoom: number }) =>
  gsap.to(globeState, { ...v, duration: 1.8, ease: "power3.inOut", overwrite: "auto" });

/** Links page scroll to the persistent globe. Nothing is pinned. */
export default function GlobeDirector() {
  useGSAP(() => {
    const seen = { hero: true, roadmap: false };
    const apply = () => {
      const on = seen.hero || seen.roadmap;
      if (on !== globeState.active) {
        globeState.active = on;
        if (on) globeState.invalidate?.();
      }
      gsap.set("#globe-backdrop", { autoAlpha: on ? 1 : 0 });
    };

    ScrollTrigger.create({
      trigger: "#top",
      start: "top bottom",
      end: "bottom 10%",
      refreshPriority: -1,
      onToggle: (self) => {
        seen.hero = self.isActive;
        apply();
      },
      onEnterBack: () => go(HERO),
    });
    // gentle zoom as the hero scrolls away
    gsap.to(globeState, {
      zoom: 1.12,
      ease: "none",
      scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true, refreshPriority: -1 },
    });
    ScrollTrigger.create({
      trigger: "#roadmap",
      start: "top 85%",
      end: "bottom 15%",
      refreshPriority: -1,
      onToggle: (self) => {
        seen.roadmap = self.isActive;
        apply();
      },
    });
    document.querySelectorAll<HTMLElement>("[data-roadmap-step]").forEach((el, i) => {
      const v = STEPS[i];
      ScrollTrigger.create({
        trigger: el,
        start: "top 60%",
        end: "bottom 40%",
        refreshPriority: -1,
        onEnter: () => go(v),
        onEnterBack: () => go(v),
      });
    });
  }, []);

  return null;
}
