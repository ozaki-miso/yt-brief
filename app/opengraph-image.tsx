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
          background: "#09090b",
          display: "flex",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Strong background glow - left */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -100,
            width: 700,
            height: 700,
            background: "radial-gradient(ellipse, rgba(56,189,248,0.2) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
        {/* Strong background glow - right */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -100,
            width: 600,
            height: 600,
            background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />

        {/* LEFT: Main copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 60px",
            width: 620,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 44 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 32px rgba(56,189,248,0.6)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 32 32">
                <polygon points="10,8 26,16 10,24" fill="white" />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: "white", letterSpacing: -1 }}>YT</span>
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  letterSpacing: -1,
                  color: "#38bdf8",
                }}
              >
                brief
              </span>
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 58,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.05,
              letterSpacing: -2,
              marginBottom: 20,
            }}
          >
            Watch less.
            <br />
            <span style={{ color: "#38bdf8" }}>Know more.</span>
          </div>

          {/* Sub */}
          <div
            style={{
              fontSize: 20,
              color: "#71717a",
              lineHeight: 1.5,
              marginBottom: 36,
            }}
          >
            Get structured insights from any YouTube video in 30 seconds.
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: 10 }}>
            {["Free to try", "Any language", "30 sec"].map((text) => (
              <div
                key={text}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(56,189,248,0.35)",
                  background: "rgba(56,189,248,0.1)",
                  color: "#7dd3fc",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Mock summary card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "48px 48px 48px 20px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 460,
              background: "#18181b",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "28px 32px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {/* Card header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 34,
                  borderRadius: 8,
                  background: "#27272a",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ width: 200, height: 10, background: "#3f3f46", borderRadius: 6 }} />
                <div style={{ width: 120, height: 8, background: "#27272a", borderRadius: 6 }} />
              </div>
            </div>

            {/* Intelligence Report label */}
            <div
              style={{
                display: "flex",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(56,189,248,0.1)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  color: "#38bdf8",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                INTELLIGENCE REPORT
              </div>
            </div>

            {/* Mock points */}
            {[
              { w: 240, label: "Key insight #1" },
              { w: 200, label: "Key insight #2" },
              { w: 220, label: "Key insight #3" },
            ].map(({ w, label }, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: "rgba(56,189,248,0.12)",
                    border: "1px solid rgba(56,189,248,0.25)",
                    color: "#38bdf8",
                    fontSize: 11,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingTop: 3 }}>
                  <div style={{ width: w, height: 9, background: "#52525b", borderRadius: 6 }} />
                  <div style={{ width: w - 40, height: 7, background: "#3f3f46", borderRadius: 6 }} />
                </div>
              </div>
            ))}

            {/* Bottom line */}
            <div
              style={{
                marginTop: 8,
                padding: "12px 16px",
                borderRadius: 12,
                background: "#0c0c0f",
                border: "1px solid rgba(56,189,248,0.15)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  color: "#38bdf8",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: 2,
                }}
              >
                THE BOTTOM LINE
              </div>
              <div style={{ width: 340, height: 7, background: "#27272a", borderRadius: 6 }} />
              <div style={{ width: 280, height: 7, background: "#27272a", borderRadius: 6 }} />
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
