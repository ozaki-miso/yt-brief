"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { FormEvent, useEffect, useRef, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

type Phase = "idle" | "scanning" | "result";
const ANON_STORAGE_KEY = "ytbrief.anonUsed.v1";
const ANON_LIMIT = 1;

type SummaryPoint = { heading: string; body: string };

type SummaryResult = {
  url: string;
  title: string;
  points: readonly SummaryPoint[];
  takeaway: string | null;
  thumbnailUrl: string | null;
  remaining: number | null;
};

type ApiSuccess = {
  url: string;
  title: string;
  points: SummaryPoint[];
  takeaway?: string | null;
  thumbnailUrl?: string | null;
  remaining?: number;
  error?: string;
  upgradeRequired?: boolean;
};

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function ScanningNetworkGraphic() {
  const cx = 100;
  const cy = 100;
  const nodeR = 78;
  const count = 6;
  const nodes = Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (i / count) * Math.PI * 2;
    return { x: cx + nodeR * Math.cos(angle), y: cy + nodeR * Math.sin(angle) };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 rounded-full bg-sky-500/10 blur-[48px]" />
        <svg width="280" height="280" viewBox="0 0 200 200" className="relative z-[1]">
          <circle cx={cx} cy={cy} r="94" fill="none" stroke="rgb(56 189 248 / 0.2)" strokeWidth="1" className="ytb-scan-ring" />
          {nodes.map((node, i) => (
            <line key={i} x1={cx} y1={cy} x2={node.x} y2={node.y} stroke="rgb(56 189 248 / 0.5)" strokeWidth="1.5" className="ytb-scan-edge" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
          <circle cx={cx} cy={cy} r="12" fill="rgb(56 189 248)" className="ytb-scan-core" />
        </svg>
      </div>
    </div>
  );
}

export default function Home() {
  const resultRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [anonLimitReached, setAnonLimitReached] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const count = Number(window.localStorage.getItem(ANON_STORAGE_KEY) ?? "0");
    setAnonLimitReached(count >= ANON_LIMIT);
    return () => abortRef.current?.abort();
  }, []);

  async function runSummarize(normalizedUrl: string, signal: AbortSignal) {
    setResult(null);
    setUpgradeRequired(false);
    setPhase("scanning");

    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: normalizedUrl }),
      signal,
    });

    let data: Partial<ApiSuccess>;
    try {
      data = await res.json() as Partial<ApiSuccess>;
    } catch {
      throw new Error("Connection lost. Please try again.");
    }

    if (!res.ok) {
      if (res.status === 401) throw new Error("Please sign in to use YT-brief.");
      if (res.status === 403) {
        setUpgradeRequired(true);
        throw new Error(data.error ?? "Summary limit reached.");
      }
      throw new Error(data.error ?? "Could not process this video.");
    }

    const summary: SummaryResult = {
      url: normalizedUrl,
      title: data.title || "Video Analysis",
      points: data.points || [],
      takeaway: data.takeaway ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      remaining: data.remaining ?? null,
    };

    // 未ログイン時は localStorage でカウント
    if (data.remaining === null) {
      const prev = Number(window.localStorage.getItem(ANON_STORAGE_KEY) ?? "0");
      const next = prev + 1;
      window.localStorage.setItem(ANON_STORAGE_KEY, String(next));
      if (next >= ANON_LIMIT) setAnonLimitReached(true);
    }

    setResult(summary);
    setPhase("result");
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (phase !== "idle" || anonLimitReached) return;

    const raw = String(new FormData(event.currentTarget).get("url") ?? "").trim();
    if (!raw) {
        setFormError("Please enter a link.");
        return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    void (async () => {
      try {
        await runSummarize(raw, controller.signal);
      } catch (err) {
        setPhase("idle");
        setFormError(err instanceof Error ? err.message : "Error occurred.");
      }
    })();
  }

  return (
    <div className="relative min-h-[100svh] bg-black text-white font-sans selection:bg-sky-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#111_0%,_#000_70%)]" />

      <header className="relative z-20 flex justify-between items-center px-4 sm:px-8 py-5 sm:py-8 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          {/* Icon mark */}
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_0_16px_rgba(56,189,248,0.45)] group-hover:shadow-[0_0_24px_rgba(56,189,248,0.65)] transition-shadow">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
              {/* Play triangle */}
              <path d="M7 5.5l8 4.5-8 4.5V5.5z" fill="white" />
              {/* Brief lines */}
              <path d="M3 14.5h5M3 16.5h3" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
          {/* Wordmark */}
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">YT</span>
            <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent leading-none">brief</span>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          <Link href="/pricing" className="text-sm font-bold text-zinc-400 hover:text-white px-3 sm:px-4 py-2 rounded-lg transition-all">
            Pricing
          </Link>
          <Show when="signed-out">
            <SignInButton>
              <button className="hidden sm:block text-sm font-bold text-zinc-200 hover:text-white px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-all">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-400 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all active:scale-95">
                Sign Up Free
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
          </Show>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center px-4 sm:px-6 pt-10 sm:pt-20 pb-32">
        <div className="w-full max-w-2xl text-center">
          {phase === "idle" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-sky-400 text-xs font-bold tracking-widest uppercase">Now Available · Free to Try</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.05]">
                Turn YouTube into<br />
                <span className="text-sky-400">your unfair advantage.</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 mb-4 sm:mb-5 max-w-lg mx-auto leading-relaxed">
                The fastest way to extract insights from any video — no matter the length, no matter the language.
              </p>

              {/* Target audience pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                  { icon: "🎓", label: "Students" },
                  { icon: "🔬", label: "Researchers" },
                  { icon: "🎬", label: "Creators" },
                  { icon: "💼", label: "Professionals" },
                  { icon: "📈", label: "Entrepreneurs" },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300">
                    {icon} {label}
                  </span>
                ))}
              </div>

              {/* Social proof bar */}
              <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 mb-8 sm:mb-10 text-zinc-600 text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="text-sky-500 font-bold">1 hr</span> video → 30 sec brief</span>
                <span className="hidden sm:block w-px h-3 bg-zinc-700" />
                <span className="flex items-center gap-1.5"><span className="text-sky-500 font-bold">100+</span> languages</span>
                <span className="hidden sm:block w-px h-3 bg-zinc-700" />
                <span className="flex items-center gap-1.5"><span className="text-sky-500 font-bold">Free</span> to start</span>
              </div>
              
              <form onSubmit={handleSubmit} className="relative group mb-4">
                {/* glow ring */}
                <div className="absolute -inset-[2px] rounded-[18px] bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 opacity-40 blur-sm group-focus-within:opacity-70 transition-opacity duration-500 pointer-events-none" />
                <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-2 flex flex-col sm:flex-row transition-all focus-within:border-sky-500/60 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
                  {/* YouTube icon */}
                  <div className="hidden sm:flex items-center pl-5 pr-2 text-zinc-600 group-focus-within:text-red-500 transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z" />
                    </svg>
                  </div>
                  <input
                    name="url"
                    type="url"
                    placeholder="Paste a YouTube link here..."
                    className="flex-1 bg-transparent px-4 sm:px-3 py-5 outline-none text-base sm:text-lg text-white placeholder:text-zinc-600"
                    required
                  />
                  <button
                    type="submit"
                    disabled={anonLimitReached}
                    className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_32px_rgba(56,189,248,0.6)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95 text-sm tracking-wide"
                  >
                    Get Brief →
                  </button>
                </div>
                {formError && !upgradeRequired && (
                  <p className="mt-4 text-red-400 text-sm font-medium">{formError}</p>
                )}
              </form>

              {upgradeRequired || anonLimitReached ? (
                <div className="mt-6 animate-in zoom-in-95 duration-300 rounded-2xl bg-sky-500/10 border border-sky-500/30 px-6 py-5 text-center">
                  <p className="text-sky-300 font-semibold mb-1">
                    {anonLimitReached && !upgradeRequired
                      ? "You've used your free brief"
                      : "Summary limit reached"}
                  </p>
                  <p className="text-zinc-400 text-sm mb-4">
                    {anonLimitReached && !upgradeRequired
                      ? "Sign in to get 3 free summaries — no credit card required."
                      : formError}
                  </p>
                  {anonLimitReached && !upgradeRequired ? (
                    <div className="flex justify-center gap-3">
                      <SignInButton>
                        <button className="text-sm font-bold text-zinc-200 hover:text-white px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-all">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton>
                        <button className="text-sm font-bold bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all">
                          Sign Up Free →
                        </button>
                      </SignUpButton>
                    </div>
                  ) : (
                    <Link
                      href="/pricing"
                      className="inline-block bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-all"
                    >
                      Upgrade Now →
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-600 font-medium mt-3">
                  No credit card · No sign‑up · First brief free in seconds
                </p>
              )}
            </div>
          )}

          {phase === "scanning" && (
            <div className="py-20 flex flex-col items-center animate-pulse">
              <ScanningNetworkGraphic />
              <h2 className="mt-12 text-2xl font-bold tracking-tight uppercase italic tracking-[0.2em]">Analyzing...</h2>
              <p className="text-zinc-500 mt-2 text-sm italic">YT-Brief Engine is scanning and structuring the content.</p>
            </div>
          )}

          {phase === "result" && result && (
            <div ref={resultRef} className="animate-in fade-in zoom-in-95 duration-500 text-left w-full">
              {result.remaining !== null && (
                <div className={`mb-6 rounded-xl px-5 py-3 text-sm font-medium flex items-center justify-between ${
                  result.remaining === 0
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                    : "bg-zinc-800/60 border border-white/5 text-zinc-400"
                }`}>
                  <span>
                    {result.remaining === 0
                      ? "You've used all summaries on this plan."
                      : `${result.remaining} ${result.remaining === 1 ? "summary" : "summaries"} remaining this month`}
                  </span>
                  {result.remaining === 0 && (
                    <Link href="/pricing" className="text-amber-300 font-bold underline hover:text-amber-200 ml-4 shrink-0">
                      Upgrade →
                    </Link>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setPhase("idle")} className="text-xs font-bold text-zinc-500 hover:text-white transition-colors tracking-widest uppercase">
                  ← New Analysis
                </button>
                <button 
                  onClick={() => {
                    const text = [
                      result.title,
                      "",
                      ...result.points.map(
                        (p, i) => `${String(i + 1).padStart(2, "0")} ${p.heading}: ${p.body}`,
                      ),
                      ...(result.takeaway ? ["", `Bottom Line: ${result.takeaway}`] : []),
                    ].join("\n");
                    copyToClipboard(text).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  className="text-xs font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-sky-400 hover:text-white transition-all shadow-lg"
                >
                  {copied ? "COPIED!" : "SHARE REPORT"}
                </button>
              </div>

              <div className="bg-zinc-900 rounded-[32px] overflow-hidden border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
                {result.thumbnailUrl && (
                  <div className="w-full aspect-video overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.thumbnailUrl}
                      alt={result.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.src.includes("hqdefault")) {
                          img.src = img.src.replace("maxresdefault", "hqdefault");
                        } else {
                          img.style.display = "none";
                          (img.parentElement as HTMLElement).style.display = "none";
                        }
                      }}
                    />
                  </div>
                )}
                <div className="p-8 sm:p-12 bg-gradient-to-br from-zinc-800/30 to-transparent border-b border-white/5">
                  <div className="inline-block px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                    Intelligence Report
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white uppercase italic tracking-tighter">
                    {result.title}
                  </h2>
                </div>

                <div className="p-5 sm:p-12 space-y-8 sm:space-y-12">
                  {result.points.map((point, i) => (
                    <div key={i} className="group flex items-start gap-4 sm:gap-6">
                      <div className="flex flex-col items-center shrink-0">
                        <span className="text-sky-500 font-black text-xl sm:text-2xl tracking-tighter italic">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <div className="w-px h-full bg-gradient-to-b from-sky-500/50 to-transparent mt-2 group-last:hidden" />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3 className="text-white text-base sm:text-lg font-bold uppercase tracking-wide">
                          {point.heading}
                        </h3>
                        <p className="text-zinc-400 leading-relaxed font-medium text-sm sm:text-[17px]">
                          {point.body}
                        </p>
                      </div>
                    </div>
                  ))}

                  {result.takeaway && (
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="bg-zinc-950 rounded-2xl p-6 border border-sky-500/20 shadow-inner">
                        <h4 className="text-sky-400 font-black text-[10px] tracking-[0.2em] uppercase mb-2">The Bottom Line</h4>
                        <p className="text-zinc-400 font-medium italic leading-relaxed text-sm">
                          &ldquo;{result.takeaway}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {phase === "idle" && (
        <>
          {/* ── TESTIMONIALS ─────────────────────────────── */}
          <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-28">
            <div className="text-center mb-14">
              <span className="text-[10px] font-bold tracking-[0.3em] text-sky-500 uppercase">What People Are Saying</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Real people. Real time saved.</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  quote: "I have a 2-hour commute every day. I used to just scroll social media. Now I get through 10+ videos worth of insights before I even reach the office. It's like having a personal research assistant.",
                  name: "Marcus T.",
                  role: "PhD Student, UC Berkeley",
                  avatar: "M",
                  color: "bg-violet-500",
                },
                {
                  quote: "I was spending 3+ hours a week watching competitor videos. YT-brief cut that down to 15 minutes. That time goes straight back into creating. Easily the best $5 I spend each month.",
                  name: "Priya S.",
                  role: "YouTube Creator · 280K subs",
                  avatar: "P",
                  color: "bg-pink-500",
                },
                {
                  quote: "My job requires staying on top of global markets — including Japanese and Korean financial content. YT-brief distills hours of foreign-language video into a clean brief in seconds. Hours saved every single week.",
                  name: "David K.",
                  role: "Hedge Fund Analyst, NYC",
                  avatar: "D",
                  color: "bg-sky-500",
                },
              ].map(({ quote, name, role, avatar, color }) => (
                <div key={name} className="flex flex-col justify-between rounded-2xl bg-zinc-900/60 border border-white/5 p-7 hover:border-white/10 transition-colors">
                  <div>
                    <div className="flex gap-0.5 mb-5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} viewBox="0 0 20 20" fill="rgb(234 179 8)" className="w-4 h-4"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {avatar}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{name}</p>
                      <p className="text-zinc-500 text-xs">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ─────────────────────────────── */}
          <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-28">
            <div className="text-center mb-14">
              <span className="text-[10px] font-bold tracking-[0.3em] text-sky-500 uppercase">How It Works</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Simple enough for anyone. Powerful enough for pros.</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
                      <rect x="3" y="5" width="18" height="14" rx="3" />
                      <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
                    </svg>
                  ),
                  title: "Paste any YouTube URL",
                  body: "Copy a video link — lectures, podcasts, news, tutorials. Any video works.",
                },
                {
                  step: "02",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" strokeLinecap="round" />
                    </svg>
                  ),
                  title: "Our engine reads the entire video",
                  body: "YT-brief extracts the transcript and runs it through our proprietary analysis engine in seconds.",
                },
                {
                  step: "03",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
                      <path d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2" strokeLinecap="round" />
                      <rect x="9" y="2" width="6" height="4" rx="1" />
                    </svg>
                  ),
                  title: "Get your intelligence brief",
                  body: "5 structured insights + a bottom-line takeaway. Ready to act on instantly.",
                },
              ].map(({ step, icon, title, body }) => (
                <div key={step} className="relative rounded-2xl bg-zinc-900/60 border border-white/5 p-7 flex flex-col gap-4 hover:border-sky-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sky-500">{icon}</div>
                    <span className="text-5xl font-black text-white/5 select-none">{step}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-snug">{title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── TRANSLATE ANY LANGUAGE ───────────────────── */}
          <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-28">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-950/60 via-zinc-900/80 to-zinc-900/60 border border-indigo-500/20 p-10 sm:p-14 flex flex-col sm:flex-row items-center gap-10">
              <div className="flex-1">
                <span className="text-[10px] font-bold tracking-[0.3em] text-indigo-400 uppercase">Global Intelligence</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Any language.<br /><span className="text-indigo-400">Zero barriers.</span>
                </h2>
                <p className="mt-5 text-zinc-400 leading-relaxed max-w-md">
                  Japanese tech talk? Spanish documentary? Korean business lecture? No matter where the video is from, YT-brief automatically detects the language and delivers a clear, structured brief.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {["🇯🇵 Japanese","🇰🇷 Korean","🇨🇳 Chinese","🇪🇸 Spanish","🇫🇷 French","🇩🇪 German","🇵🇹 Portuguese","🇮🇳 Hindi","+ more"].map((lang) => (
                    <span key={lang} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300">{lang}</span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-3 select-none">
                <div className="flex gap-2 text-3xl">
                  {["🇯🇵","🇰🇷","🇪🇸","🇫🇷"].map(f => <span key={f} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10">{f}</span>)}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-1">
                    {[0,1,2,3].map(i => <div key={i} className="w-0.5 h-5 bg-indigo-500/40 rounded-full" style={{animationDelay:`${i*0.15}s`}} />)}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="rgb(129 140 248)" strokeWidth="1.5" className="w-5 h-5">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" />
                    </svg>
                  </div>
                  <div className="flex gap-1">
                    {[0,1,2,3].map(i => <div key={i} className="w-0.5 h-5 bg-sky-500/40 rounded-full" style={{animationDelay:`${i*0.15}s`}} />)}
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30">
                  <span className="text-sky-400 font-bold text-sm">✦ Instant Brief</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── FEATURES GRID ────────────────────────────── */}
          <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-32">
            <div className="text-center mb-14">
              <span className="text-[10px] font-bold tracking-[0.3em] text-sky-500 uppercase">What You Get</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Everything you need. Nothing you don't.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { emoji: "⚡", title: "30-second briefs", body: "No more scrubbing through hour-long videos for a single insight." },
                { emoji: "🌍", title: "Works worldwide", body: "Videos from any country, any platform — as long as it's on YouTube." },
                { emoji: "🧠", title: "Proprietary analysis engine", body: "Our in-house intelligence engine extracts and structures the key insights for you." },
                { emoji: "📋", title: "Copy & share", body: "Export your brief as clean text and share it with your team instantly." },
                { emoji: "🎓", title: "Lectures & courses", body: "Catch up on online classes or research talks without watching every minute." },
                { emoji: "📰", title: "News & documentaries", body: "Stay informed across languages without reading long articles." },
                { emoji: "🚀", title: "Creator research", body: "Analyze competitor videos and trending topics in seconds." },
                { emoji: "🔒", title: "No data stored", body: "Your briefs stay on your screen. We never store your video content." },
              ].map(({ emoji, title, body }) => (
                <div key={title} className="rounded-2xl bg-zinc-900/40 border border-white/5 p-6 hover:bg-zinc-900/70 hover:border-white/10 transition-all">
                  <div className="text-2xl mb-3">{emoji}</div>
                  <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── FINAL CTA ────────────────────────────────── */}
          <section className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 text-center">
            <div className="rounded-3xl bg-gradient-to-br from-sky-950/60 via-zinc-900/80 to-zinc-900/60 border border-sky-500/20 px-8 py-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Ready to learn faster?<br /><span className="text-sky-400">Your first brief is free.</span>
              </h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                No account required. Paste a YouTube link and get your first brief in under 30 seconds.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-block bg-sky-500 hover:bg-sky-400 text-white font-bold px-10 py-4 rounded-2xl shadow-[0_0_32px_rgba(56,189,248,0.35)] hover:shadow-[0_0_48px_rgba(56,189,248,0.5)] transition-all text-sm active:scale-95"
              >
                Get My Free Brief →
              </button>
            </div>
          </section>

          {/* ── FOOTER ───────────────────────────────────── */}
          <footer className="relative z-10 w-full border-t border-white/5 py-10 text-center">
            <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-700 uppercase">
              YT-BRIEF · Condensed Intelligence
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-zinc-700">
              <Link href="/pricing" className="hover:text-zinc-400 transition-colors">Pricing</Link>
              <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
              <Link href="/refund" className="hover:text-zinc-400 transition-colors">Refund Policy</Link>
              <Link href="/tokusho" className="hover:text-zinc-400 transition-colors">特定商取引法に基づく表記</Link>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}