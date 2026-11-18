/** Mutable scene state shared between GSAP ScrollTriggers (DOM) and the R3F scene. */
export const globeState = {
  /** target longitude/latitude (deg) the globe should face */
  lon: 125,
  lat: 14,
  zoom: 1,
  /** horizontal offset in world units on desktop (globe sits right of the headline) */
  offsetX: 0.95,
  /** reveal 0..1 for each arc: [Tokyo→Benguet, Benguet→Jakarta, Benguet→Delhi, Benguet→Maputo] */
  reveal: [0, 0, 0, 0] as number[],
  /** whether the canvas is on screen (loop is paused otherwise) */
  active: true,
  invalidate: null as null | (() => void),
};

export type City = { id: string; lat: number; lon: number; major?: boolean };

export const CITIES: City[] = [
  { id: "tokyo", lat: 35.68, lon: 139.69, major: true },
  { id: "benguet", lat: 16.4, lon: 120.6, major: true },
  { id: "jakarta", lat: -6.2, lon: 106.85 },
  { id: "delhi", lat: 28.61, lon: 77.2 },
  { id: "maputo", lat: -25.97, lon: 32.57 },
];

export const ARCS: [string, string][] = [
  ["tokyo", "benguet"],
  ["benguet", "jakarta"],
  ["benguet", "delhi"],
  ["benguet", "maputo"],
];
