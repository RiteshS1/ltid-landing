"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { globeState } from "@/lib/globeState";

const VIEWS = [
  { lon: 121, lat: 17, zoom: 1.28, reveal: [1, 0, 0, 0] },
  { lon: 112, lat: 4, zoom: 1.02, reveal: [1, 1, 0, 0] },
  { lon: 72, lat: 2, zoom: 0.78, reveal: [1, 1, 1, 1] },
];

/** Connects page scroll position to the persistent 3D globe. */
export default function GlobeDirector() {
  useGSAP(() => {
    const seen = { hero: true, roadmap: false };
    const setActive = () => {
      const on = seen.hero || seen.roadmap;
      if (on !== globeState.active) {
        globeState.active = on;
        if (on) globeState.invalidate?.();
      }
      gsap.to("#globe-backdrop", { opacity: on ? 1 : 0, duration: 0.4, overwrite: true });
    };

    ScrollTrigger.create({
      trigger: "#top",
      start: "top bottom",
      end: "bottom 15%",
      refreshPriority: -1,
      onToggle: (self) => {
        seen.hero = self.isActive;
        setActive();
      },
    });
    ScrollTrigger.create({
      trigger: "#roadmap",
      start: "top 90%",
      end: "bottom 10%",
      refreshPriority: -1,
      onToggle: (self) => {
        seen.roadmap = self.isActive;
        setActive();
      },
    });

    // hero → globe focuses on the Philippines; leaving hero drifts slightly
    gsap.to(globeState, {
      lon: 128,
      zoom: 1.12,
      ease: "none",
      scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true, refreshPriority: -1 },
    });

    document.querySelectorAll<HTMLElement>("[data-roadmap-step]").forEach((el, i) => {
      const v = VIEWS[i];
      const go = () => {
        gsap.to(globeState, { lon: v.lon, lat: v.lat, zoom: v.zoom, duration: 1.8, ease: "power3.inOut", overwrite: "auto" });
        v.reveal.forEach((r, k) => {
          if (k > 0 || i > 0) gsap.to(globeState.reveal, { [k]: r, duration: 2, ease: "power2.inOut", overwrite: "auto" });
        });
      };
      ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 40%", refreshPriority: -1, onEnter: go, onEnterBack: go });
    });
  }, []);

  return null;
}
