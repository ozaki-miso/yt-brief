import type { NextConfig } from "next";

const securityHeaders = [
  // クリックジャッキング防止
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // MIMEタイプスニッフィング防止
  { key: "X-Content-Type-Options", value: "nosniff" },
  // XSS対策
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // リファラー情報の制限
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HTTPS強制（HSTS）
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // 不要なブラウザ機能を無効化
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // コンテンツセキュリティポリシー
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.accounts.dev https://*.clerk.accounts.dev https://*.clerk.com https://clerk.yt-brief.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://*.clerk.com https://clerk.yt-brief.com",
      "img-src 'self' data: blob: https://img.youtube.com https://img.clerk.com https://*.clerk.com https://clerk.yt-brief.com",
      "font-src 'self' https://*.clerk.com https://clerk.yt-brief.com",
      "connect-src 'self' https://*.clerk.accounts.dev https://api.clerk.dev https://clerk.dev https://*.clerk.com https://clerk.yt-brief.com https://*.stripe.com https://api.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.yt-brief.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
