import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a2118" }}>
        <svg width="132" height="132" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="15" fill="#ee4b2b" />
          <path d="M16 25V13M16 18c-3.6 0-6-2.6-6-6 3.6 0 6 2.6 6 6ZM16 21c3.6 0 6-2.6 6-6-3.6 0-6 2.6-6 6Z" fill="none" stroke="#f5efe2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
