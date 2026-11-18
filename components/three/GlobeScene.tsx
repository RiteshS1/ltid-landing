"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import land from "@/lib/data/land-dots.json";
import { ARCS, CITIES, globeState } from "@/lib/globeState";
import Island from "./Island";
import { Clouds, Petals, Sun } from "./Atmosphere3D";

const deg = Math.PI / 180;

function ll(lat: number, lon: number, r = 1) {
  return new THREE.Vector3(
    r * Math.cos(lat * deg) * Math.sin(lon * deg),
    r * Math.sin(lat * deg),
    r * Math.cos(lat * deg) * Math.cos(lon * deg),
  );
}

/* ---------- Land dots ---------- */
const dotVert = /* glsl */ `
  uniform float uTime;
  uniform float uPx;
  uniform vec3 uCenter;
  varying float vAlpha;
  varying float vGlow;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float facing = dot(normalize(normalMatrix * position), vec3(0.0, 0.0, 1.0));
    vAlpha = smoothstep(-0.15, 0.45, facing);
    float d = acos(clamp(dot(normalize(position), uCenter), -1.0, 1.0));
    float wave = fract(uTime * 0.12) * 2.2;
    vGlow = smoothstep(0.07, 0.0, abs(wave - d)) * 0.8;
    gl_PointSize = (2.1 + vGlow * 2.5) * uPx * (3.4 / -mv.z);
  }
`;
const dotFrag = /* glsl */ `
  varying float vAlpha;
  varying float vGlow;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.15, r);
    vec3 base = vec3(0.96, 0.90, 0.76);
    vec3 hot = vec3(1.0, 0.45, 0.20);
    vec3 col = mix(base, hot, vGlow);
    gl_FragColor = vec4(col, soft * vAlpha * (0.6 + vGlow));
  }
`;

function LandDots() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();
  const positions = useMemo(() => {
    const arr = new Float32Array(land.length * 3);
    land.forEach(([lat, lon], i) => {
      const v = ll(lat, lon, 1.002);
      arr.set([v.x, v.y, v.z], i * 3);
    });
    return arr;
  }, []);
  const center = useMemo(() => ll(16.4, 120.6).normalize(), []);

  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={dotVert}
        fragmentShader={dotFrag}
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uPx: { value: Math.min(gl.getPixelRatio(), 2) * 2.6 },
          uCenter: { value: center },
        }}
      />
    </points>
  );
}

/* ---------- Atmosphere ---------- */
function Atmosphere() {
  return (
    <mesh scale={1.14}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          varying vec3 vN;
          void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `}
        fragmentShader={/* glsl */ `
          varying vec3 vN;
          void main(){
            float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 3.0);
            gl_FragColor = vec4(vec3(1.0,0.55,0.22), 1.0) * clamp(i, 0.0, 1.0) * 0.45;
          }
        `}
      />
    </mesh>
  );
}

function Core() {
  return (
    <mesh>
      <sphereGeometry args={[0.992, 64, 64]} />
      <meshBasicMaterial color="#0d3a25" />
    </mesh>
  );
}

/* ---------- Arcs ---------- */
function Arc({ index, from, to }: { index: number; from: THREE.Vector3; to: THREE.Vector3 }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => {
    const angle = from.angleTo(to);
    const mid = from.clone().add(to).normalize().multiplyScalar(1 + 0.12 + angle * 0.45);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    return new THREE.TubeGeometry(curve, 80, 0.0035, 6, false);
  }, [from, to]);

  useFrame(({ clock }) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = clock.elapsedTime;
    mat.current.uniforms.uReveal.value = globeState.reveal[index] ?? 0;
  });

  return (
    <mesh geometry={geo}>
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ uTime: { value: 0 }, uReveal: { value: 0 }, uOffset: { value: index * 0.27 } }}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `}
        fragmentShader={/* glsl */ `
          uniform float uTime; uniform float uReveal; uniform float uOffset;
          varying vec2 vUv;
          void main(){
            if (vUv.x > uReveal) discard;
            float p = fract(uTime * 0.28 + uOffset);
            float pulse = exp(-pow((vUv.x - p) * 9.0, 2.0));
            vec3 col = mix(vec3(1.0,0.42,0.2), vec3(1.0,0.86,0.4), pulse);
            float edge = smoothstep(uReveal, uReveal - 0.04, vUv.x);
            gl_FragColor = vec4(col, (0.45 + pulse * 0.9) * edge);
          }
        `}
      />
    </mesh>
  );
}

/* ---------- City pins ---------- */
function Pin({ lat, lon, major }: { lat: number; lon: number; major?: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const pos = useMemo(() => ll(lat, lon, 1.004), [lat, lon]);

  useEffect(() => {
    group.current?.lookAt(pos.clone().multiplyScalar(2));
  }, [pos]);

  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.elapsedTime * 0.6 + lon * 0.01) % 1;
    ring.current.scale.setScalar(1 + t * (major ? 3.2 : 2.2));
    (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.8;
  });

  return (
    <group ref={group} position={pos}>
      <mesh>
        <sphereGeometry args={[major ? 0.016 : 0.011, 16, 16]} />
        <meshBasicMaterial color={major ? "#ffb020" : "#ff6a3d"} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.014, 0.019, 32]} />
        <meshBasicMaterial color={major ? "#ffb020" : "#ff6a3d"} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ---------- Stars ---------- */
function Stars() {
  const pos = useMemo(() => {
    const n = 700;
    const a = new Float32Array(n * 3);
    // deterministic PRNG (mulberry32) so render stays pure
    let seed = 0x9e3779b9;
    const rnd = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = 0; i < n; i++) {
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const r = 6 + rnd() * 5;
      const sq = Math.sqrt(1 - u * u);
      a.set([r * sq * Math.cos(th), r * u, r * sq * Math.sin(th)], i * 3);
    }
    return a;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#f5efe2" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ---------- Rig: follows globeState ---------- */
function Rig({ reduced }: { reduced: boolean }) {
  const globeOuter = useRef<THREE.Group>(null);
  const globeInner = useRef<THREE.Group>(null);
  const islandWrap = useRef<THREE.Group>(null);
  const islandSpin = useRef<THREE.Group>(null);
  const stars = useRef<THREE.Group>(null);
  const skyProps = useRef<THREE.Group>(null);
  const mix = useRef(0);
  const { size, invalidate } = useThree();

  useEffect(() => {
    globeState.invalidate = invalidate;
    const onMove = (e: PointerEvent) => {
      globeState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      globeState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      globeState.invalidate = null;
      window.removeEventListener("pointermove", onMove);
    };
  }, [invalidate]);

  const cities = useMemo(() => Object.fromEntries(CITIES.map((c) => [c.id, ll(c.lat, c.lon, 1.004)])), []);

  useFrame((state, dt) => {
    if (!globeState.active) return;
    const k = 1 - Math.pow(0.001, dt);
    const desktop = size.width >= 900;
    const t = state.clock.elapsedTime;
    const p = globeState.pointer;

    mix.current = THREE.MathUtils.lerp(mix.current, globeState.mode, k * 0.9);
    const m = mix.current;

    /* ----- island (hero) ----- */
    const iw = islandWrap.current;
    const isp = islandSpin.current;
    if (iw && isp) {
      iw.visible = m < 0.5;
      const base = desktop ? 0.66 : 0.37;
      iw.scale.setScalar(THREE.MathUtils.lerp(iw.scale.x, base * (1 - m) * (1 - globeState.heroScroll * 0.25), k * 0.6));
      const tx = desktop ? 1.95 : 0;
      const ty = (desktop ? -0.15 : -1.45) + globeState.heroScroll * 1.1 + Math.sin(t * 0.9) * 0.07;
      iw.position.x = THREE.MathUtils.lerp(iw.position.x, tx - p.x * 0.18, k * 0.5);
      iw.position.y = THREE.MathUtils.lerp(iw.position.y, ty - p.y * 0.1, k * 0.5);
      const auto = reduced ? 0.6 : t * 0.1;
      isp.rotation.y = THREE.MathUtils.lerp(isp.rotation.y, auto + p.x * 0.55 + globeState.heroScroll * 1.8, k * 0.35);
      isp.rotation.x = THREE.MathUtils.lerp(isp.rotation.x, 0.42 - p.y * 0.16 + globeState.heroScroll * 0.2, k * 0.35);
    }

    /* ----- globe (roadmap) ----- */
    const go = globeOuter.current;
    const gi = globeInner.current;
    if (go && gi) {
      go.visible = m > 0.02;
      const sway = reduced ? 0 : Math.sin(t * 0.15) * 4;
      gi.rotation.y = THREE.MathUtils.lerp(gi.rotation.y, -(globeState.lon + sway) * deg + p.x * 0.12, k * 0.6);
      go.rotation.x = THREE.MathUtils.lerp(go.rotation.x, globeState.lat * deg - p.y * 0.08, k * 0.6);
      const s = THREE.MathUtils.lerp(go.scale.x, globeState.zoom * (desktop ? 1.15 : 1.0) * m, k * 0.6);
      go.scale.setScalar(Math.max(s, 0.0001));
      go.position.x = THREE.MathUtils.lerp(go.position.x, desktop ? 1.9 : 0, k * 0.6);
      go.position.y = THREE.MathUtils.lerp(go.position.y, desktop ? 0 : -1.1, k * 0.6);
    }
    if (stars.current) stars.current.visible = m > 0.5;
    if (skyProps.current) skyProps.current.visible = m < 0.5;

    /* camera parallax */
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, p.x * 0.35, k * 0.4);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, 0.9 + p.y * 0.25, k * 0.4);
    cam.lookAt(0, 0.2, 0);
    state.invalidate(); // keep looping while active
  });

  return (
    <>
      {/* ---------- hero: farm island ---------- */}
      <group ref={islandWrap}>
        <group ref={islandSpin}>
          <Island />
        </group>
      </group>
      <group ref={skyProps}>
        <Sun />
        <Clouds />
      </group>
      <Petals />

      {/* ---------- roadmap: globe ---------- */}
      <group ref={stars}>
        <Stars />
      </group>
      <group ref={globeOuter}>
        <group ref={globeInner} rotation={[0, -125 * deg, 0]}>
          <Core />
          <LandDots />
          <Atmosphere />
          {CITIES.map((c) => (
            <Pin key={c.id} lat={c.lat} lon={c.lon} major={c.major} />
          ))}
          {ARCS.map(([a, b], i) => (
            <Arc key={a + b} index={i} from={cities[a]} to={cities[b]} />
          ))}
        </group>
      </group>
    </>
  );
}

export default function GlobeScene() {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const lowPower = useMemo(
    () => typeof window !== "undefined" && (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4),
    [],
  );

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, lowPower ? 1.5 : 2]}
      camera={{ fov: 32, position: [0, 0.9, 8] }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <hemisphereLight args={["#ffe3c4", "#7aa84a", 1.15]} />
      <directionalLight position={[4, 6, 5]} intensity={2.3} color="#fff0d6" />
      <directionalLight position={[-5, 2, -3]} intensity={0.7} color="#ffb08a" />
      <Rig reduced={reduced} />
      {!lowPower && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.45} luminanceThreshold={0.92} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
