"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import land from "@/lib/data/land-dots.json";
import { ARCS, CITIES, globeState } from "@/lib/globeState";

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
    vGlow = smoothstep(0.18, 0.0, abs(wave - d)) * 0.9;
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
    vec3 base = vec3(0.10, 0.70, 0.66);
    vec3 hot = vec3(0.95, 0.80, 0.40);
    vec3 col = mix(base, hot, vGlow);
    gl_FragColor = vec4(col * (0.75 + vGlow), soft * vAlpha * (0.55 + vGlow));
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
          uPx: { value: Math.min(gl.getPixelRatio(), 2) * 1.25 },
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
            gl_FragColor = vec4(vec3(0.05,0.78,0.72), 1.0) * clamp(i, 0.0, 1.0) * 0.9;
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
      <meshBasicMaterial color="#061f21" />
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
            vec3 col = mix(vec3(0.10,0.83,0.71), vec3(0.95,0.72,0.29), pulse);
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
        <meshBasicMaterial color={major ? "#f2b84b" : "#19d3b5"} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.014, 0.019, 32]} />
        <meshBasicMaterial color={major ? "#f2b84b" : "#19d3b5"} transparent depthWrite={false} side={THREE.DoubleSide} />
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
      <pointsMaterial size={0.018} color="#9fe9dc" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ---------- Rig: follows globeState ---------- */
function Rig({ reduced }: { reduced: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const { size, invalidate } = useThree();

  useEffect(() => {
    globeState.invalidate = invalidate;
    return () => {
      globeState.invalidate = null;
    };
  }, [invalidate]);

  const cities = useMemo(() => Object.fromEntries(CITIES.map((c) => [c.id, ll(c.lat, c.lon, 1.004)])), []);

  useFrame((state, dt) => {
    if (!globeState.active) return;
    const k = 1 - Math.pow(0.001, dt); // frame-rate independent damping
    const desktop = size.width >= 900;
    if (outer.current && inner.current) {
      const sway = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.15) * 4;
      inner.current.rotation.y = THREE.MathUtils.lerp(inner.current.rotation.y, -(globeState.lon + sway) * deg, k * 0.6);
      outer.current.rotation.x = THREE.MathUtils.lerp(outer.current.rotation.x, globeState.lat * deg, k * 0.6);
      const s = THREE.MathUtils.lerp(outer.current.scale.x, globeState.zoom * (desktop ? 1 : 0.82), k * 0.6);
      outer.current.scale.setScalar(s);
      const tx = desktop ? globeState.offsetX : 0;
      const ty = desktop ? 0 : -0.8;
      outer.current.position.x = THREE.MathUtils.lerp(outer.current.position.x, tx, k * 0.6);
      outer.current.position.y = THREE.MathUtils.lerp(outer.current.position.y, ty, k * 0.6);
    }
    // gentle pointer parallax
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, state.pointer.x * 0.25, k * 0.4);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, state.pointer.y * 0.18, k * 0.4);
    cam.lookAt(0, 0, 0);
    state.invalidate(); // keep looping while active
  });

  return (
    <group ref={outer}>
      <group ref={inner} rotation={[0, -125 * deg, 0]}>
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
      camera={{ fov: 35, position: [0, 0, 4.2] }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Stars />
      <Rig reduced={reduced} />
      {!lowPower && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.7} luminanceThreshold={0.25} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
