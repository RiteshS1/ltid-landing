import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og-font";

export const alt = "LTID — Turning the world's farms into a digital cooperative / 世界の農業を、デジタル農協で。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const EN = "Turning the world's farms into a digital cooperative.";
const JA = "世界の農業を、デジタル農協で。";
const META = "LTID FINANCE × DISTRIBUTION × AI CONCEPT PREVIEW 農 金融 流通";

// a few land-ish dots on the globe, pre-baked so the image is deterministic
const DOTS: [number, number][] = [];
for (let y = -150; y <= 150; y += 14) {
  for (let x = -150; x <= 150; x += 14) {
    const r = Math.hypot(x, y);
    const land = Math.sin(x * 0.045) + Math.cos(y * 0.06 + x * 0.01) > 0.55;
    if (r < 150 && land) DOTS.push([x, y]);
  }
}

export default async function Image() {
  const [display, jp] = await Promise.all([
    loadGoogleFont("Bricolage Grotesque", 800, EN + META),
    loadGoogleFont("Shippori Mincho", 700, JA + META),
  ]);
  const fonts = [
    display && { name: "Display", data: display, weight: 800 as const, style: "normal" as const },
    jp && { name: "JP", data: jp, weight: 700 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 800 | 700; style: "normal" }[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "radial-gradient(circle at 78% 45%, #3a2416 0%, #12382a 26%, #0a2118 52%, #040a07 100%)",
          color: "#f5efe2",
          fontFamily: "Display, JP",
        }}
      >
        <div style={{ display: "flex", flex: 1, padding: "56px 64px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 640 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, background: "#ee4b2b", fontFamily: "JP", fontSize: 26 }}>農</div>
              <div style={{ fontSize: 30, letterSpacing: 6 }}>LTID</div>
            </div>
            <div style={{ display: "flex", marginTop: 44, fontSize: 60, lineHeight: 1.06, letterSpacing: -1 }}>{EN}</div>
            <div style={{ display: "flex", marginTop: 26, fontFamily: "JP", fontSize: 40, color: "#ffb020" }}>{JA}</div>
          </div>
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                width: 330,
                height: 330,
                borderRadius: 999,
                background: "radial-gradient(circle at 35% 30%, #123d2a 0%, #071a12 70%)",
                boxShadow: "0 0 0 3px #ee4b2b, 0 0 80px 10px rgba(238,75,43,0.45)",
              }}
            >
              {DOTS.map(([x, y], i) => (
                <div key={i} style={{ position: "absolute", left: 165 + x - 2, top: 165 + y - 2, width: 4, height: 4, borderRadius: 4, background: "#f0dcb4", opacity: 0.85 }} />
              ))}
              <svg width="330" height="330" style={{ position: "absolute", left: 0, top: 0 }}>
                <path d="M228 96 Q 200 120 196 168" stroke="#ffb020" strokeWidth="3" fill="none" />
                <path d="M196 168 Q 150 150 110 120" stroke="#ee4b2b" strokeWidth="3" fill="none" />
                <path d="M196 168 Q 170 210 150 236" stroke="#ee4b2b" strokeWidth="3" fill="none" />
                <path d="M196 168 Q 120 230 60 250" stroke="#ee4b2b" strokeWidth="3" fill="none" />
                <circle cx="228" cy="96" r="7" fill="#ffb020" />
                <circle cx="196" cy="168" r="8" fill="#ffb020" />
                <circle cx="196" cy="168" r="18" stroke="#ffb020" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 74,
            marginTop: 30,
            padding: "0 64px",
            background: "#ffb020",
            color: "#17140f",
            borderTop: "4px solid #17140f",
            fontSize: 24,
            letterSpacing: 4,
          }}
        >
          FINANCE × DISTRIBUTION × AI · <span style={{ fontFamily: "JP", marginLeft: 16 }}>金融 × 流通</span>
          <span style={{ marginLeft: "auto", fontSize: 18 }}>CONCEPT PREVIEW</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
