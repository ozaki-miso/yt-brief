import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "YT-brief — Turn YouTube into your unfair advantage.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000000 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            background: "radial-gradient(ellipse, rgba(56,189,248,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #38bdf8, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(56,189,248,0.5)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32">
              <polygon points="10,8 26,16 10,24" fill="white" />
            </svg>
          </div>
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontSize: 52, fontWeight: 900, color: "white", letterSpacing: -2 }}>YT</span>
            <span
              style={{
                fontSize: 52,
                fontWeight: 900,
                letterSpacing: -2,
                background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              brief
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: -2,
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          Turn YouTube into your
          <span style={{ color: "#38bdf8" }}> unfair advantage.</span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 24,
            color: "#71717a",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          The fastest way to extract insights from any video.
        </div>

        {/* Bottom badges */}
        <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
          {["1 hr video → 30 sec brief", "100+ languages", "Free to start"].map((text) => (
            <div
              key={text}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid rgba(56,189,248,0.3)",
                background: "rgba(56,189,248,0.08)",
                color: "#38bdf8",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
