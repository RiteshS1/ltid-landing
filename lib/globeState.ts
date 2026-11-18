/** Mutable scene state shared between GSAP ScrollTriggers / DOM and the R3F scene. */
export const globeState = {
  /** 0 = farm island (hero), 1 = globe (roadmap) */
  mode: 0,
  /** globe target orientation */
  lon: 125,
  lat: 14,
  zoom: 1,
  /** arc reveal 0..1: [Tokyo→Benguet, Benguet→Jakarta, Benguet→Delhi, Benguet→Maputo] */
  reveal: [0, 0, 0, 0] as number[],
  /** scroll progress through the hero, 0..1 (drives island yaw / lift) */
  heroScroll: 0,
  /** normalised pointer, -1..1 */
  pointer: { x: 0, y: 0 },
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
