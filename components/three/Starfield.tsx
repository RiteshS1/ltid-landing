"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rng } from "@/lib/rng";
import { globeState } from "@/lib/globeState";

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uPx;
  attribute float aSize;
  attribute float aPhase;
  attribute float aBright;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.65 + 0.35 * sin(uTime * (0.6 + aPhase * 1.8) + aPhase * 40.0);
    vAlpha = aBright * tw;
    gl_PointSize = aSize * uPx;
  }
`;
const frag = /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.0, r);
    gl_FragColor = vec4(vec3(0.97, 0.94, 0.86), vAlpha * core);
  }
`;

/** Fine, dense star dust in three depth layers that parallax against the cursor. */
export default function Starfield() {
  const layers = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const { gl } = useThree();

  const data = useMemo(() => {
    const r = rng(1234);
    return [
      { n: 1600, depth: 18, spread: 34, size: [0.8, 1.6] },
      { n: 700, depth: 12, spread: 24, size: [1.0, 2.0] },
      { n: 160, depth: 8, spread: 16, size: [1.6, 2.8] },
    ].map((L) => {
      const pos = new Float32Array(L.n * 3);
      const size = new Float32Array(L.n);
      const phase = new Float32Array(L.n);
      const bright = new Float32Array(L.n);
      for (let i = 0; i < L.n; i++) {
        pos.set([(r() - 0.5) * L.spread, (r() - 0.5) * L.spread * 0.62, -L.depth + (r() - 0.5) * 2], i * 3);
        size[i] = L.size[0] + r() * (L.size[1] - L.size[0]);
        phase[i] = r();
        // most stars faint, a few bright
        bright[i] = 0.18 + Math.pow(r(), 3) * 0.82;
      }
      return { pos, size, phase, bright, depth: L.depth };
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = globeState.pointer;
    data.forEach((L, i) => {
      const g = layers.current[i];
      if (g) {
        const k = 1 / L.depth; // nearer layers move more
        g.position.x = THREE.MathUtils.lerp(g.position.x, -p.x * 6 * k, 0.05);
        g.position.y = THREE.MathUtils.lerp(g.position.y, -p.y * 4 * k, 0.05);
        g.rotation.z = t * 0.004 * (i + 1);
      }
      const m = mats.current[i];
      if (m) m.uniforms.uTime.value = t;
    });
  });

  const px = Math.min(gl.getPixelRatio(), 2);

  return (
    <>
      {data.map((L, i) => (
        <group key={i} ref={(el) => void (layers.current[i] = el)}>
          <points frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[L.pos, 3]} />
              <bufferAttribute attach="attributes-aSize" args={[L.size, 1]} />
              <bufferAttribute attach="attributes-aPhase" args={[L.phase, 1]} />
              <bufferAttribute attach="attributes-aBright" args={[L.bright, 1]} />
            </bufferGeometry>
            <shaderMaterial
              ref={(el) => void (mats.current[i] = el)}
              vertexShader={vert}
              fragmentShader={frag}
              transparent
              depthWrite={false}
              uniforms={{ uTime: { value: 0 }, uPx: { value: px } }}
            />
          </points>
        </group>
      ))}
    </>
  );
}
