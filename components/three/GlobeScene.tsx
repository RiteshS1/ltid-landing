"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import land from "@/lib/data/land-dots.json";
import { ARCS, PLACES, REGION_LABELS, globeState } from "@/lib/globeState";
import Starfield from "./Starfield";

const deg = Math.PI / 180;
/** key light direction in globe-local space is rotated with the camera, so define it in view space */
const LIGHT = new THREE.Vector3(-0.55, 0.55, 0.65).normalize();

function ll(lat: number, lon: number, r = 1) {
  return new THREE.Vector3(
    r * Math.cos(lat * deg) * Math.sin(lon * deg),
    r * Math.sin(lat * deg),
    r * Math.cos(lat * deg) * Math.cos(lon * deg),
  );
}

/* ------------------------------------------------------------------ */
/* ocean sphere – lit, with terminator shading and a warm fresnel rim   */
/* ------------------------------------------------------------------ */
function Ocean() {
  return (
    <mesh>
      <sphereGeometry args={[1, 96, 96]} />
      <shaderMaterial
        uniforms={{ uLight: { value: LIGHT } }}
        vertexShader={/* glsl */ `
          varying vec3 vN;
          void main() {
            vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uLight;
          varying vec3 vN;
          void main() {
            float diff = max(dot(vN, uLight), 0.0);
            vec3 night = vec3(0.002, 0.008, 0.006);
            vec3 day = vec3(0.012, 0.05, 0.032);
            vec3 col = mix(night, day, pow(diff, 0.9));
            // soft specular sheen
            vec3 h = normalize(uLight + vec3(0.0, 0.0, 1.0));
            col += vec3(1.0, 0.7, 0.45) * pow(max(dot(vN, h), 0.0), 60.0) * 0.05;
            // warm rim
            float fres = pow(1.0 - max(dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
            col += vec3(0.9, 0.22, 0.08) * fres * (0.08 + 0.35 * diff);
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* land dots – shaded by the same light                                 */
/* ------------------------------------------------------------------ */
function LandDots() {
  const { gl } = useThree();
  const positions = useMemo(() => {
    const arr = new Float32Array(land.length * 3);
    land.forEach(([lat, lon], i) => {
      const v = ll(lat, lon, 1.003);
      arr.set([v.x, v.y, v.z], i * 3);
    });
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{ uPx: { value: Math.min(gl.getPixelRatio(), 2) }, uLight: { value: LIGHT } }}
        vertexShader={/* glsl */ `
          uniform float uPx;
          uniform vec3 uLight;
          varying float vLit;
          varying float vFace;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            vec3 n = normalize(normalMatrix * position);
            vFace = n.z;
            vLit = max(dot(n, uLight), 0.0);
            gl_PointSize = (1.6 + 1.1 * vLit) * uPx * (5.2 / -mv.z);
          }
        `}
        fragmentShader={/* glsl */ `
          varying float vLit;
          varying float vFace;
          void main() {
            float r = length(gl_PointCoord - 0.5);
            if (r > 0.5) discard;
            vec3 night = vec3(0.05, 0.12, 0.09);
            vec3 day = vec3(0.95, 0.82, 0.6);
            vec3 col = mix(night, day, smoothstep(0.0, 0.7, vLit));
            float a = smoothstep(0.5, 0.2, r) * smoothstep(-0.05, 0.35, vFace) * (0.45 + 0.55 * vLit);
            gl_FragColor = vec4(col, a);
          }
        `}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* graticule – faint lat/long grid for sphericity                      */
/* ------------------------------------------------------------------ */
function Graticule() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const seg = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -75; lat <= 75; lat += 15)
      for (let lon = 0; lon < 360; lon += 3) seg(ll(lat, lon, 1.001), ll(lat, lon + 3, 1.001));
    for (let lon = 0; lon < 360; lon += 15)
      for (let lat = -87; lat < 87; lat += 3) seg(ll(lat, lon, 1.001), ll(lat + 3, lon, 1.001));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={/* glsl */ `
          varying float vFace;
          void main() {
            vFace = normalize(normalMatrix * position).z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          varying float vFace;
          void main() { gl_FragColor = vec4(0.96, 0.9, 0.8, 0.05 * smoothstep(0.0, 0.5, vFace)); }
        `}
      />
    </lineSegments>
  );
}

/* ------------------------------------------------------------------ */
/* atmosphere halo                                                      */
/* ------------------------------------------------------------------ */
function Halo() {
  return (
    <mesh scale={1.09}>
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
            float i = pow(max(0.6 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 6.0);
            gl_FragColor = vec4(vec3(1.0, 0.38, 0.16) * i * 0.75, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* arcs – draw → travel → fade loop, ripple on landing                  */
/* ------------------------------------------------------------------ */
const PERIOD = 5.2;

function Arc({ from, to, offset }: { from: THREE.Vector3; to: THREE.Vector3; offset: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);

  const geo = useMemo(() => {
    const angle = from.angleTo(to);
    const mid = from.clone().add(to).normalize().multiplyScalar(1 + 0.08 + angle * 0.32);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    return new THREE.TubeGeometry(curve, 96, 0.0038, 6, false);
  }, [from, to]);

  const ringQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), to.clone().normalize());
    return q;
  }, [to]);

  useFrame(({ clock }) => {
    const t = ((clock.elapsedTime + offset) / PERIOD) % 1;
    if (mat.current) mat.current.uniforms.uT.value = t;
    if (ring.current) {
      const rt = THREE.MathUtils.clamp((t - 0.42) / 0.45, 0, 1);
      ring.current.visible = rt > 0 && rt < 1;
      ring.current.scale.setScalar(0.4 + rt * 2.0);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - rt) * 0.7;
    }
  });

  return (
    <>
      <mesh geometry={geo}>
        <shaderMaterial
          ref={mat}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{ uT: { value: 0 } }}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
          `}
          fragmentShader={/* glsl */ `
            uniform float uT;
            varying vec2 vUv;
            float ease(float x){ return x < 0.5 ? 4.0*x*x*x : 1.0 - pow(-2.0*x + 2.0, 3.0) / 2.0; }
            void main(){
              float x = vUv.x;
              float head = ease(clamp(uT / 0.42, 0.0, 1.0));
              float tail = ease(clamp((uT - 0.3) / 0.55, 0.0, 1.0));
              // faint permanent connection line
              float base = 0.1;
              float on = step(tail, x) * step(x, head);
              float along = clamp((x - tail) / max(head - tail, 1e-3), 0.0, 1.0);
              float trail = on * pow(along, 1.6);
              float spark = exp(-pow((x - head) * 55.0, 2.0)) * step(head, 0.999);
              vec3 col = mix(vec3(0.93, 0.29, 0.17), vec3(1.0, 0.8, 0.35), along);
              float a = base + trail * 0.9 + spark * 1.4;
              gl_FragColor = vec4(mix(col, vec3(1.0, 0.95, 0.8), spark), a);
            }
          `}
        />
      </mesh>
      <mesh ref={ring} position={to.clone().multiplyScalar(1.004)} quaternion={ringQuat}>
        <ringGeometry args={[0.016, 0.019, 48]} />
        <meshBasicMaterial color="#ffb020" transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* pins + labels                                                       */
/* ------------------------------------------------------------------ */
function Pin({ pos, hub }: { pos: THREE.Vector3; hub?: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
    return q;
  }, [pos]);

  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.elapsedTime * 0.45 + pos.x) % 1;
    ring.current.scale.setScalar(1 + t * 1.8);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.6;
  });

  const color = hub ? "#ffb020" : "#ee4b2b";
  return (
    <group position={pos.clone().multiplyScalar(1.004)} quaternion={quat}>
      <mesh>
        <circleGeometry args={[hub ? 0.014 : 0.009, 24]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {hub && (
        <mesh ref={ring}>
          <ringGeometry args={[0.018, 0.021, 40]} />
          <meshBasicMaterial color={color} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/**
 * Projects label anchors to screen space every frame and moves plain DOM
 * labels (rendered by GlobeBackdrop) — no extra React roots per label.
 */
function LabelProjector({ anchors }: { anchors: { key: string; pos: THREE.Vector3; offset: [number, number] }[] }) {
  const refs = useRef<(THREE.Object3D | null)[]>([]);
  const els = useRef<(HTMLElement | null)[]>([]);
  const v = useMemo(() => ({ w: new THREE.Vector3(), c: new THREE.Vector3(), n: new THREE.Vector3(), e: new THREE.Vector3() }), []);

  useFrame(({ camera, size }) => {
    anchors.forEach((a, i) => {
      const o = refs.current[i];
      if (!o || !o.parent) return;
      let el = els.current[i];
      if (!el) {
        el = document.querySelector<HTMLElement>(`[data-globe-label="${a.key}"]`);
        els.current[i] = el;
        if (!el) return;
      }
      o.getWorldPosition(v.w);
      o.parent.getWorldPosition(v.c);
      v.n.copy(v.w).sub(v.c).normalize();
      v.e.copy(camera.position).sub(v.w).normalize();
      const facing = v.n.dot(v.e);
      const p = v.w.clone().project(camera);
      const x = (p.x * 0.5 + 0.5) * size.width + a.offset[0];
      const y = (-p.y * 0.5 + 0.5) * size.height + a.offset[1];
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = String(THREE.MathUtils.clamp((facing - 0.2) * 3, 0, 1));
    });
  });

  return (
    <>
      {anchors.map((a, i) => (
        <object3D key={a.key} position={a.pos} ref={(el) => void (refs.current[i] = el)} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* rig                                                                 */
/* ------------------------------------------------------------------ */
function Rig({ reduced }: { reduced: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
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

  const places = useMemo(() => Object.fromEntries(PLACES.map((p) => [p.id, ll(p.lat, p.lon, 1.004)])), []);
  const anchors = useMemo(
    () => [
      ...PLACES.filter((p) => p.label).map((p) => ({ key: p.label!, pos: ll(p.lat, p.lon, 1.01), offset: [10, -26] as [number, number] })),
      ...REGION_LABELS.map((r) => ({ key: r.key, pos: ll(r.lat, r.lon, 1.01), offset: [-40, -10] as [number, number] })),
    ],
    [],
  );

  useFrame((state, dt) => {
    if (!globeState.active) return;
    const k = 1 - Math.pow(0.001, dt);
    const desktop = size.width >= 900;
    const p = globeState.pointer;

    // drag inertia + slow idle drift
    if (!globeState.dragging) {
      globeState.spinVel *= Math.pow(0.04, dt);
      globeState.spin += globeState.spinVel;
      if (!reduced) globeState.spin += dt * 2.2; // deg/s idle drift
    }

    const o = outer.current;
    const i = inner.current;
    if (o && i) {
      i.rotation.y = THREE.MathUtils.lerp(i.rotation.y, -(globeState.lon + globeState.spin) * deg, globeState.dragging ? 0.5 : k * 0.5);
      o.rotation.x = THREE.MathUtils.lerp(o.rotation.x, globeState.lat * deg - p.y * 0.06, k * 0.5);
      o.rotation.z = THREE.MathUtils.lerp(o.rotation.z, -p.x * 0.04, k * 0.5);
      const s = globeState.zoom * (desktop ? 1.0 : 0.95);
      o.scale.setScalar(THREE.MathUtils.lerp(o.scale.x, s, k * 0.5));
      o.position.x = THREE.MathUtils.lerp(o.position.x, desktop ? 1.3 : 0, k * 0.5);
      o.position.y = THREE.MathUtils.lerp(o.position.y, desktop ? -0.02 : -1.45, k * 0.5);
    }
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, p.x * 0.18, k * 0.3);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, p.y * 0.12, k * 0.3);
    cam.lookAt(0, 0, 0);
    state.invalidate();
  });

  return (
    <group ref={outer}>
      <Halo />
      <group ref={inner} rotation={[0, -112 * deg, 0]}>
        <Ocean />
        <Graticule />
        <LandDots />
        {PLACES.map((pl) => (
          <Pin key={pl.id} pos={ll(pl.lat, pl.lon)} hub={pl.hub} />
        ))}
        <LabelProjector anchors={anchors} />
        {ARCS.map(([a, b], n) => (
          <Arc key={a + b} from={places[a]} to={places[b]} offset={n * (PERIOD / ARCS.length) * 1.7} />
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
      camera={{ fov: 35, position: [0, 0, 5.2] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Starfield />
      <Rig reduced={reduced} />
      {!lowPower && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.35} luminanceThreshold={0.8} luminanceSmoothing={0.15} radius={0.45} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
