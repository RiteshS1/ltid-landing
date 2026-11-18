/** Mutable scene state shared between GSAP ScrollTriggers / DOM and the R3F scene. */
export const globeState = {
  /** target orientation (degrees) and zoom */
  lon: 112,
  lat: 14,
  zoom: 1,
  /** user drag: accumulated spin (deg) and current velocity (deg/frame) */
  spin: 0,
  spinVel: 0,
  dragging: false,
  /** normalised pointer, -1..1 */
  pointer: { x: 0, y: 0 },
  active: true,
  invalidate: null as null | (() => void),
};

export type Place = { id: string; lat: number; lon: number; hub?: boolean; label?: string };

/** Pins. `label` is a key in the "Globe" message namespace. */
export const PLACES: Place[] = [
  { id: "tokyo", lat: 35.68, lon: 139.69, hub: true, label: "tokyo" },
  { id: "benguet", lat: 16.4, lon: 120.6, hub: true, label: "benguet" },
  { id: "bangkok", lat: 13.75, lon: 100.5 },
  { id: "hcmc", lat: 10.8, lon: 106.7 },
  { id: "jakarta", lat: -6.2, lon: 106.85 },
  { id: "delhi", lat: 28.61, lon: 77.2, label: "india" },
  { id: "maputo", lat: -25.97, lon: 32.57, label: "mozambique" },
];

/** Free-floating region labels (no pin). */
export const REGION_LABELS = [{ key: "sea", lat: -2, lon: 98 }];

export const ARCS: [string, string][] = [
  ["tokyo", "benguet"],
  ["benguet", "hcmc"],
  ["benguet", "bangkok"],
  ["benguet", "jakarta"],
  ["benguet", "delhi"],
  ["tokyo", "delhi"],
  ["benguet", "maputo"],
];
