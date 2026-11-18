"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { globeState } from "@/lib/globeState";

const VIEWS = [
  { lon: 121, lat: 17, zoom: 1.28, reveal: [1, 0, 0, 0] },
  { lon: 112, lat: 4, zoom: 1.02, reveal: [1, 1, 0, 0] },
  { lon: 72, lat: 2, zoom: 0.78, reveal: [1, 1, 1, 1] },
];

/** Connects page scroll position to the persistent 3D stage. No pinning: scroll is never held. */
export default function GlobeDirector() {
  useGSAP(() => {
    const seen = { hero: true, roadmap: false };

    const apply = () => {
      const on = seen.hero || seen.roadmap;
      if (on !== globeState.active) {
        globeState.active = on;
        if (on) globeState.invalidate?.();
      }
      globeState.mode = seen.roadmap ? 1 : 0;
      gsap.set("#globe-backdrop", { autoAlpha: on ? 1 : 0 });
      gsap.set("#bg-sky", { opacity: seen.roadmap ? 0 : 1 });
      gsap.set("#bg-night", { opacity: seen.roadmap ? 1 : 0 });
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
      onUpdate: (self) => {
        globeState.heroScroll = self.progress;
      },
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

    // draw the first arc a moment after the globe first shows
    gsap.to(globeState.reveal, { 0: 1, duration: 2.4, ease: "power2.inOut", paused: false, scrollTrigger: { trigger: "#roadmap", start: "top 85%", once: true, refreshPriority: -1 } });

    document.querySelectorAll<HTMLElement>("[data-roadmap-step]").forEach((el, i) => {
      const v = VIEWS[i];
      const go = () => {
        gsap.to(globeState, { lon: v.lon, lat: v.lat, zoom: v.zoom, duration: 1.8, ease: "power3.inOut", overwrite: "auto" });
        v.reveal.forEach((r, k) => {
          gsap.to(globeState.reveal, { [k]: r, duration: 2, ease: "power2.inOut", overwrite: "auto" });
        });
      };
      ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 40%", refreshPriority: -1, onEnter: go, onEnterBack: go });
    });
  }, []);

  return null;
}
