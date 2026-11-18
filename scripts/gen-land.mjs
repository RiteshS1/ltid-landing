// Generates lib/data/land-dots.json: [lat, lon] pairs on land (Natural Earth 110m via world-atlas).
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(topo, topo.objects.land);

const STEP = 1.1; // degrees
const out = [];
for (let lat = -58; lat <= 84; lat += STEP) {
  // keep dot density uniform-ish on the sphere
  const lonStep = STEP / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  for (let lon = -180; lon < 180; lon += lonStep) {
    if (geoContains(land, [lon, lat])) out.push([+lat.toFixed(2), +lon.toFixed(2)]);
  }
}
writeFileSync("lib/data/land-dots.json", JSON.stringify(out));
console.log("land dots:", out.length);
