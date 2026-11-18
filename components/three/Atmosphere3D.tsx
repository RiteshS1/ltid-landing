"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rng } from "@/lib/rng";
import { globeState } from "@/lib/globeState";

/* ---------------- petals / pollen: react to the cursor ---------------- */

const petalVert = /* glsl */ `
  uniform float uTime;
  uniform float uPx;
  uniform vec2 uMouse;
  uniform vec2 uPointer;
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float H = 8.0;
    p.y = mod(p.y - uTime * (0.25 + aPhase * 0.25) + H * 0.5, H) - H * 0.5;
    p.x += sin(uTime * 0.6 + aPhase * 6.28) * 0.5 + uPointer.x * p.z * 0.22;
    p.y += uPointer.y * p.z * 0.12;
    p.z += cos(uTime * 0.4 + aPhase * 6.28) * 0.3;
    // cursor repel
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float push = smoothstep(1.9, 0.0, dist);
    p.xy += normalize(d + 1e-4) * push * 1.1;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPx * (6.5 / -mv.z) * (1.0 + push * 0.6);
    vColor = aColor;
    vAlpha = 0.95 - smoothstep(3.5, 5.0, abs(p.y));
  }
`;
const petalFrag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    c.x *= 1.35; // petal-ish ellipse
    float r = length(c);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.25, r);
    gl_FragColor = vec4(vColor, soft * vAlpha);
  }
`;

export function Petals() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();
  const { pos, size, phase, color } = useMemo(() => {
    const r = rng(33);
    const n = 240;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const phase = new Float32Array(n);
    const color = new Float32Array(n * 3);
    const palette = ["#ff9fb8", "#ffb7c9", "#ffd0dc", "#ffc24d", "#f5efe2"].map((c) => new THREE.Color(c));
    for (let i = 0; i < n; i++) {
      pos.set([(r() - 0.5) * 13, (r() - 0.5) * 8, r() * 5 - 2.2], i * 3);
      size[i] = 0.6 + r() * 1.1;
      phase[i] = r();
      const c = palette[Math.floor(r() * palette.length)];
      color.set([c.r, c.g, c.b], i * 3);
    }
    return { pos, size, phase, color };
  }, []);

  useFrame(({ clock, viewport }) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value = clock.elapsedTime;
    const p = globeState.pointer;
    m.uniforms.uMouse.value.set((p.x * viewport.width) / 2, (p.y * viewport.height) / 2);
    m.uniforms.uPointer.value.set(p.x, p.y);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[size, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phase, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[color, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={petalVert}
        fragmentShader={petalFrag}
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uPx: { value: Math.min(gl.getPixelRatio(), 2) * 10 },
          uMouse: { value: new THREE.Vector2(99, 99) },
          uPointer: { value: new THREE.Vector2() },
        }}
      />
    </points>
  );
}

/* ---------------- clouds with depth parallax ---------------- */

export function Clouds() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const clouds = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 5 }, (_, i) => ({
      x: (r() - 0.5) * 16,
      y: (r() - 0.35) * 5.2,
      z: -4.5 + r() * 5.5,
      s: 0.5 + r() * 0.7,
      sp: 0.12 + r() * 0.2,
      i,
    }));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = globeState.pointer;
    clouds.forEach((c, i) => {
      const g = refs.current[i];
      if (!g) return;
      const x = ((c.x + t * c.sp + 9) % 18) - 9;
      const depth = (c.z + 5) / 6; // 0 far … 1 near
      g.position.set(x - p.x * depth * 0.9, c.y - p.y * depth * 0.4, c.z);
    });
  });

  return (
    <>
      {clouds.map((c, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)} scale={c.s}>
          {[
            [0, 0, 0, 0.55],
            [0.55, -0.08, 0.05, 0.42],
            [-0.55, -0.1, 0, 0.38],
            [0.1, 0.22, 0, 0.36],
          ].map(([x, y, z, r], k) => (
            <mesh key={k} position={[x, y, z]} scale={[1.3, 0.72, 1]}>
              <icosahedronGeometry args={[r, 1]} />
              <meshStandardMaterial color="#fff6ea" emissive="#ffe3c8" emissiveIntensity={0.5} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

/* ---------------- big rising sun ---------------- */

export function Sun() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock, size }) => {
    if (!g.current) return;
    const p = globeState.pointer;
    const mobile = size.width < 900;
    g.current.scale.setScalar(mobile ? 0.5 : 1);
    g.current.position.x = (mobile ? 0.2 : 1.6) - p.x * 0.5;
    g.current.position.y = (mobile ? -1.1 : 1.1) - p.y * 0.25 - globeState.heroScroll * 1.2;
    g.current.rotation.z = clock.elapsedTime * 0.02;
  });
  return (
    <group ref={g} position={[1.6, 1.1, -5.5]}>
      <mesh>
        <circleGeometry args={[2.7, 64]} />
        <meshBasicMaterial color="#ff4a2a" toneMapped={false} />
      </mesh>
      {[3.4, 4.2, 5.1].map((r, i) => (
        <mesh key={r} position={[0, 0, -0.01 * (i + 1)]}>
          <ringGeometry args={[r, r + 0.05, 96]} />
          <meshBasicMaterial color="#ff6a3d" transparent opacity={0.35 - i * 0.09} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
