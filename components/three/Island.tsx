"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { hash3, rng } from "@/lib/rng";
import { globeState } from "@/lib/globeState";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

/** Roughen a geometry deterministically (shared vertices move together). */
function roughen(geo: THREE.BufferGeometry, amp: number, ampY = 0) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = +p.getX(i).toFixed(3);
    const y = +p.getY(i).toFixed(3);
    const z = +p.getZ(i).toFixed(3);
    p.setX(i, x + (hash3(x, y, z) - 0.5) * amp);
    p.setZ(i, z + (hash3(z, x, y) - 0.5) * amp);
    if (ampY) p.setY(i, y + (hash3(y, z, x) - 0.5) * ampY);
  }
  geo.computeVertexNormals();
  return geo;
}

const C = {
  earth: "#8a5a3b",
  earthDark: "#6b4429",
  rock: "#8c6b53",
  grass: "#7cc243",
  grassDark: "#5fa233",
  water: "#58cdd0",
  road: "#d9b377",
  shu: "#ee4b2b",
  sun: "#ffb020",
  paper: "#f5efe2",
  sumi: "#17140f",
  sakura: "#ffb7c9",
  sakura2: "#ffd0dc",
};

/** radii / geometry of the terraces */
const R = [2.6, 1.95, 1.4, 0.9];
const H = 0.34;
const topY = (i: number) => (i + 1) * H + 0.04;

/* ------------------------------------------------------------------ */
/* terraces                                                            */
/* ------------------------------------------------------------------ */

function Terraces() {
  const tiers = useMemo(
    () =>
      R.map((r, i) => ({
        wall: roughen(new THREE.CylinderGeometry(r, r * 1.05, H, 11, 1), 0.07),
        top: roughen(new THREE.CylinderGeometry(r * 0.955, r * 0.955, 0.05, 11, 1), 0.05),
        r,
        i,
      })),
    [],
  );
  const base = useMemo(() => {
    const g = new THREE.ConeGeometry(R[0] * 1.02, 2.5, 11, 3);
    g.rotateX(Math.PI);
    return roughen(g, 0.34, 0.2);
  }, []);
  const road = useMemo(() => new THREE.RingGeometry(2.14, 2.42, 56), []);

  return (
    <group>
      {/* floating rock */}
      <mesh geometry={base} position={[0, -1.25, 0]}>
        <meshStandardMaterial color={C.rock} flatShading roughness={1} />
      </mesh>
      {tiers.map((t) => (
        <group key={t.i}>
          <mesh geometry={t.wall} position={[0, t.i * H + H / 2, 0]}>
            <meshStandardMaterial color={t.i % 2 ? C.earthDark : C.earth} flatShading roughness={1} />
          </mesh>
          <mesh geometry={t.top} position={[0, (t.i + 1) * H + 0.02, 0]}>
            {t.i === 1 ? (
              <meshStandardMaterial color={C.water} emissive="#2aa7ad" emissiveIntensity={0.35} flatShading roughness={0.15} metalness={0.2} />
            ) : (
              <meshStandardMaterial color={t.i === 2 ? C.grassDark : C.grass} flatShading roughness={1} />
            )}
          </mesh>
        </group>
      ))}
      {/* road around the lowest terrace */}
      <mesh geometry={road} rotation={[-Math.PI / 2, 0, 0]} position={[0, topY(0) + 0.012, 0]}>
        <meshStandardMaterial color={C.road} roughness={1} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* crops – instanced, swaying; react to how fast the cursor moves       */
/* ------------------------------------------------------------------ */

type Crop = { x: number; y: number; z: number; ph: number; s: number };

function Crops() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const speed = useRef(0);
  const last = useRef({ x: 0, y: 0 });

  const { crops, colors } = useMemo(() => {
    const rand = rng(7);
    const list: Crop[] = [];
    const cols: THREE.Color[] = [];
    const ring = (rho: number, y: number, gap: number, palette: string[], scale: number) => {
      const n = Math.floor((Math.PI * 2 * rho) / gap);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + rand() * 0.04;
        list.push({ x: Math.cos(a) * rho, y, z: Math.sin(a) * rho, ph: rand() * 6.28, s: scale * (0.85 + rand() * 0.3) });
        cols.push(new THREE.Color(palette[Math.floor(rand() * palette.length)]));
      }
    };
    const greens = ["#5fb135", "#7cc243", "#8fd14a"];
    const golds = ["#e9b53a", "#f4c94d", "#dca12a"];
    // tier 0: one row beside the road
    ring(2.0, topY(0), 0.15, greens, 1);
    // tier 1 (paddy): seedlings standing in the water
    [1.5, 1.65, 1.8].forEach((r) => ring(r, topY(1), 0.14, greens, 0.7));
    // tier 2: ripening gold
    [1.04, 1.18, 1.3].forEach((r) => ring(r, topY(2), 0.13, golds, 1.05));
    return { crops: list, colors: cols };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.05, 0.22, 5);
    g.translate(0, 0.11, 0);
    return g;
  }, []);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    colors.forEach((c, i) => m.setColorAt(i, c));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [colors]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }, dt) => {
    const m = mesh.current;
    if (!m) return;
    const p = globeState.pointer;
    const v = Math.hypot(p.x - last.current.x, p.y - last.current.y) / Math.max(dt, 0.001);
    last.current = { x: p.x, y: p.y };
    speed.current = THREE.MathUtils.lerp(speed.current, Math.min(v, 6), 0.1);
    const t = clock.elapsedTime;
    const amp = 0.1 + speed.current * 0.1;
    crops.forEach((c, i) => {
      const wave = Math.sin(t * 1.8 + c.x * 1.6 + c.z * 1.2 + c.ph * 0.3);
      dummy.position.set(c.x, c.y, c.z);
      dummy.rotation.set(wave * amp, 0, Math.cos(t * 1.5 + c.ph) * amp);
      dummy.scale.setScalar(c.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geo, undefined, crops.length]} frustumCulled={false}>
      <meshStandardMaterial flatShading roughness={0.9} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* vehicles on the road                                                */
/* ------------------------------------------------------------------ */

function Wheel({ r, w, x, y, z }: { r: number; w: number; x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, w, 14]} />
        <meshStandardMaterial color="#25211c" flatShading />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 0.5, r * 0.5, w + 0.01, 10]} />
        <meshStandardMaterial color={C.sun} flatShading />
      </mesh>
    </group>
  );
}

function Tractor() {
  return (
    <group>
      <mesh position={[0.1, 0.17, 0]}>
        <boxGeometry args={[0.3, 0.14, 0.2]} />
        <meshStandardMaterial color={C.shu} flatShading />
      </mesh>
      <mesh position={[0.26, 0.19, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.17]} />
        <meshStandardMaterial color={C.shu} flatShading />
      </mesh>
      <mesh position={[0.31, 0.3, 0.04]}>
        <cylinderGeometry args={[0.018, 0.018, 0.1, 6]} />
        <meshStandardMaterial color={C.sumi} flatShading />
      </mesh>
      <mesh position={[-0.02, 0.32, 0]}>
        <boxGeometry args={[0.15, 0.13, 0.17]} />
        <meshStandardMaterial color={C.paper} flatShading />
      </mesh>
      <mesh position={[-0.02, 0.4, 0]}>
        <boxGeometry args={[0.19, 0.02, 0.21]} />
        <meshStandardMaterial color={C.sumi} flatShading />
      </mesh>
      <Wheel r={0.11} w={0.06} x={-0.04} y={0.11} z={0.13} />
      <Wheel r={0.11} w={0.06} x={-0.04} y={0.11} z={-0.13} />
      <Wheel r={0.06} w={0.05} x={0.27} y={0.06} z={0.11} />
      <Wheel r={0.06} w={0.05} x={0.27} y={0.06} z={-0.11} />
    </group>
  );
}

function Truck() {
  return (
    <group>
      <mesh position={[-0.08, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.04, 0.23]} />
        <meshStandardMaterial color={C.sumi} flatShading />
      </mesh>
      <mesh position={[-0.08, 0.3, 0]}>
        <boxGeometry args={[0.38, 0.17, 0.22]} />
        <meshStandardMaterial color={C.sun} flatShading />
      </mesh>
      {[-0.2, -0.08, 0.04].map((x, i) => (
        <mesh key={x} position={[x, 0.42, i % 2 ? 0.05 : -0.04]}>
          <boxGeometry args={[0.1, 0.08, 0.1]} />
          <meshStandardMaterial color={i % 2 ? "#9ccf53" : "#7cc243"} flatShading />
        </mesh>
      ))}
      <mesh position={[0.2, 0.27, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.22]} />
        <meshStandardMaterial color={C.paper} flatShading />
      </mesh>
      <mesh position={[0.275, 0.3, 0]}>
        <boxGeometry args={[0.01, 0.07, 0.17]} />
        <meshStandardMaterial color="#58cdd0" flatShading />
      </mesh>
      <Wheel r={0.075} w={0.05} x={-0.2} y={0.075} z={0.12} />
      <Wheel r={0.075} w={0.05} x={-0.2} y={0.075} z={-0.12} />
      <Wheel r={0.075} w={0.05} x={0.2} y={0.075} z={0.12} />
      <Wheel r={0.075} w={0.05} x={0.2} y={0.075} z={-0.12} />
    </group>
  );
}

function Vehicles() {
  const tractor = useRef<THREE.Group>(null);
  const truck = useRef<THREE.Group>(null);
  const rho = 2.28;
  useFrame(({ clock }) => {
    const a = clock.elapsedTime * 0.32;
    const place = (g: THREE.Group | null, th: number) => {
      if (!g) return;
      g.position.set(Math.cos(th) * rho, topY(0), -Math.sin(th) * rho);
      g.rotation.y = th + Math.PI / 2;
    };
    place(tractor.current, a);
    place(truck.current, a + Math.PI);
  });
  return (
    <>
      <group ref={tractor}>
        <Tractor />
      </group>
      <group ref={truck}>
        <Truck />
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* summit: hut, torii, sakura                                          */
/* ------------------------------------------------------------------ */

function Summit() {
  const y = topY(3);
  return (
    <group position={[0, y, 0]}>
      {/* hut */}
      <group position={[-0.28, 0, -0.1]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[0.4, 0.26, 0.3]} />
          <meshStandardMaterial color={C.paper} flatShading />
        </mesh>
        <mesh position={[0, 0.36, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.36, 0.22, 4]} />
          <meshStandardMaterial color="#3a352f" flatShading />
        </mesh>
        <mesh position={[0, 0.09, 0.151]}>
          <boxGeometry args={[0.1, 0.17, 0.01]} />
          <meshStandardMaterial color="#5b3a25" flatShading />
        </mesh>
      </group>
      {/* torii */}
      <group position={[0.38, 0, 0.3]} rotation={[0, -0.7, 0]}>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0.21, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.42, 8]} />
            <meshStandardMaterial color={C.shu} flatShading />
          </mesh>
        ))}
        <mesh position={[0, 0.41, 0]}>
          <boxGeometry args={[0.4, 0.04, 0.06]} />
          <meshStandardMaterial color={C.sumi} flatShading />
        </mesh>
        <mesh position={[0, 0.33, 0]}>
          <boxGeometry args={[0.3, 0.03, 0.04]} />
          <meshStandardMaterial color={C.shu} flatShading />
        </mesh>
      </group>
      {/* sakura */}
      <group position={[0.05, 0, -0.38]}>
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.035, 0.05, 0.34, 6]} />
          <meshStandardMaterial color="#5b3a25" flatShading />
        </mesh>
        {[
          [0, 0.46, 0, 0.26, C.sakura],
          [0.16, 0.4, 0.06, 0.18, C.sakura2],
          [-0.15, 0.42, -0.04, 0.2, C.sakura2],
          [0.02, 0.58, 0.04, 0.15, C.sakura],
        ].map(([x, yy, z, r, col], i) => (
          <mesh key={i} position={[x as number, yy as number, z as number]}>
            <icosahedronGeometry args={[r as number, 1]} />
            <meshStandardMaterial color={col as string} flatShading roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* little pines */}
      {[
        [-0.5, 0.25],
        [0.55, -0.2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[0, 0.13, 0.25].map((h, k) => (
            <mesh key={k} position={[0, 0.08 + h, 0]}>
              <coneGeometry args={[0.15 - k * 0.04, 0.2, 6]} />
              <meshStandardMaterial color="#2f7d3a" flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* small floating rocks orbiting the bottom                             */
/* ------------------------------------------------------------------ */

function Debris() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const rocks = useMemo(() => {
    const r = rng(21);
    return Array.from({ length: 6 }, (_, i) => ({
      a: (i / 6) * Math.PI * 2,
      rho: 1.6 + r() * 1.2,
      y: -1.4 - r() * 1.1,
      s: 0.1 + r() * 0.16,
      sp: 0.1 + r() * 0.15,
      geo: roughen(new THREE.IcosahedronGeometry(1, 0), 0.4),
    }));
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    rocks.forEach((r, i) => {
      const m = refs.current[i];
      if (!m) return;
      const a = r.a + t * r.sp;
      m.position.set(Math.cos(a) * r.rho, r.y + Math.sin(t * 0.8 + i) * 0.1, Math.sin(a) * r.rho);
      m.rotation.set(t * 0.3 + i, t * 0.2, 0);
    });
  });
  return (
    <>
      {rocks.map((r, i) => (
        <mesh key={i} ref={(el) => void (refs.current[i] = el)} geometry={r.geo} scale={r.s}>
          <meshStandardMaterial color={C.rock} flatShading roughness={1} />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* island root                                                         */
/* ------------------------------------------------------------------ */

export default function Island() {
  return (
    <group>
      <Terraces />
      <Crops />
      <Vehicles />
      <Summit />
      <Debris />
    </group>
  );
}
