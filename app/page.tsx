"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type Phase = "idle" | "scanning" | "result";
const FREE_SUMMARY_STORAGE_KEY = "ytbrief.freeSummaryUsed.v1";

type SummaryResult = {
  url: string;
  title: string;
  points: readonly string[]; 
};

type ApiSuccess = {
  url: string;
  title: string;
  points: string[]; 
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
  const [hasUsedFreeSummary, setHasUsedFreeSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(FREE_SUMMARY_STORAGE_KEY);
    setHasUsedFreeSummary(false);
    return () => abortRef.current?.abort();
  }, []);

  async function runSummarize(normalizedUrl: string, signal: AbortSignal) {
    setResult(null);
    setPhase("scanning");

    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: normalizedUrl }),
      signal,
    });

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new Error("Connection lost. Please try again.");
    }

    if (!res.ok) throw new Error("Could not process this video.");

    const payload = data as Partial<ApiSuccess>;
    const summary: SummaryResult = {
      url: normalizedUrl,
      title: payload.title || "Video Analysis",
      points: payload.points || [], 
    };

   // window.localStorage.setItem(FREE_SUMMARY_STORAGE_KEY, "1");
   // setHasUsedFreeSummary(true);
    setResult(summary);
    setPhase("result");
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (phase !== "idle" || hasUsedFreeSummary) return;

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

      <header className="relative z-20 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
  <div className="text-4xl font-black tracking-tighter text-white italic">
    YT<span className="text-indigo-500">.</span>brief
  </div>

  <div className="flex items-center gap-3 sm:gap-6">
    <Link 
      href="/pricing" 
      className="text-sm font-bold text-zinc-400 hover:text-white px-4 py-2 rounded-lg transition-all"
    >
      Pricing
    </Link>
    <button className="bg-white/10 hover:bg-white text-white hover:text-black text-sm font-bold px-6 py-2.5 rounded-xl border border-white/10 hover:border-white transition-all shadow-lg active:scale-95">
      Login
    </button>
  </div>
</header>

      <main className="relative z-10 flex flex-col items-center px-6 pt-20 pb-32">
        <div className="w-full max-w-2xl text-center">
          {phase === "idle" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
                Stop watching. <br />
                <span className="text-sky-500">Start knowing.</span>
              </h1>
              <p className="text-lg text-zinc-400 mb-12 max-w-md mx-auto leading-relaxed">
                   Get 30 minutes of insights in just 30 seconds. <br className="hidden sm:block" />
                  <br /> Built for your busy life.
              </p>
              
              <form onSubmit={handleSubmit} className="relative group mb-4">
                <div className="overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-2 flex flex-col sm:flex-row transition-all focus-within:border-sky-500/50 shadow-2xl">
                  <input
                    name="url"
                    type="url"
                    placeholder="Paste a YouTube link here..."
                    className="flex-1 bg-transparent px-6 py-4 outline-none text-lg"
                    required
                  />
                  <button
                    type="submit"
                    disabled={hasUsedFreeSummary}
                    className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-sky-400 hover:text-white transition-all disabled:opacity-50"
                  >
                    Get Brief
                  </button>
                </div>
                {formError && <p className="mt-4 text-red-500 text-sm font-medium">{formError}</p>}
              </form>
              <p className="text-xs text-zinc-600 font-medium">No registration required for your first brief.</p>

              {hasUsedFreeSummary && (
                <div className="mt-6 animate-in zoom-in-95 duration-300">
                  <p className="text-sky-400 text-sm font-semibold italic">
                    Free limit reached. <Link href="/pricing" className="underline hover:text-sky-300 transition-colors">Unlock unlimited access</Link>
                  </p>
                </div>
              )}
            </div>
          )}

          {phase === "scanning" && (
            <div className="py-20 flex flex-col items-center animate-pulse">
              <ScanningNetworkGraphic />
              <h2 className="mt-12 text-2xl font-bold tracking-tight uppercase italic tracking-[0.2em]">Synthesizing...</h2>
              <p className="text-zinc-500 mt-2 text-sm italic">Extracting high-value insights from the content.</p>
            </div>
          )}

          {phase === "result" && result && (
            <div ref={resultRef} className="animate-in fade-in zoom-in-95 duration-500 text-left w-full">
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setPhase("idle")} className="text-xs font-bold text-zinc-500 hover:text-white transition-colors tracking-widest uppercase">
                  ← New Analysis
                </button>
                <button 
                  onClick={() => {
                    const text = `${result.title}\n\n${result.points.map((p, i) => `0${i+1}: ${p}`).join("\n")}`;
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
                <div className="p-8 sm:p-12 bg-gradient-to-br from-zinc-800/30 to-transparent border-b border-white/5">
                  <div className="inline-block px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                    Intelligence Report
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white uppercase italic tracking-tighter">
                    {result.title}
                  </h2>
                </div>

                <div className="p-8 sm:p-12 space-y-12">
                  {result.points.map((point, i) => {
                    // コロンがある時だけ分割。ない時はそのまま表示。
                    const hasDelimiter = point.includes(':');
                    let title = "";
                    let description = point;

                    if (hasDelimiter) {
                      const parts = point.split(':');
                      title = parts[0].trim();
                      description = parts.slice(1).join(':').trim();
                    }

                    return (
                      <div key={i} className="group flex items-start gap-6">
                        <div className="flex flex-col items-center">
                          <span className="text-sky-500 font-black text-2xl tracking-tighter italic">
                            {(i + 1).toString().padStart(2, '0')}
                          </span>
                          <div className="w-px h-full bg-gradient-to-b from-sky-500/50 to-transparent mt-2 group-last:hidden" />
                        </div>
                        <div className="space-y-2 flex-1">
                          {hasDelimiter && (
                            <h3 className="text-white text-lg font-bold uppercase tracking-wide">
                              {title}
                            </h3>
                          )}
                          <p className={`${hasDelimiter ? 'text-zinc-400' : 'text-zinc-200 text-xl'} leading-relaxed font-medium text-[17px]`}>
                            {description}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="bg-zinc-950 rounded-2xl p-6 border border-sky-500/20 shadow-inner">
                      <h4 className="text-sky-400 font-black text-[10px] tracking-[0.2em] uppercase mb-2">The Bottom Line</h4>
                      <p className="text-zinc-400 font-medium italic leading-relaxed text-sm">
                        "This brief captures the essential narrative logic of the video. Use these synthesized insights to stay informed while reclaiming your time."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-8 w-full text-center z-0 pointer-events-none opacity-20">
        <p className="text-[10px] font-bold tracking-[0.4em] text-white uppercase">
          YT-BRIEF Condensed Intelligence
        </p>
      </footer>
    </div>
  );
}