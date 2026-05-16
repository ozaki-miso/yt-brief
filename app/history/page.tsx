"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import type { HistoryItem } from "@/lib/redis";

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/history")
      .then((r) => r.json())
      .then((d: { history?: HistoryItem[] }) => setHistory(d.history ?? []))
      .catch(() => null)
      .finally(() => setLoading(false));
    fetch("/api/account")
      .then((r) => r.json())
      .then((d: { plan?: string }) => setPlan(d.plan ?? "free"))
      .catch(() => null);
  }, [isLoaded, user]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch("/api/history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setHistory((prev) => prev.filter((h) => h.id !== id));
    setDeletingId(null);
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-zinc-400">Sign in to view your history.</p>
        <Link href="/" className="text-sky-400 hover:text-sky-300 font-bold">← Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-sky-500 text-sm font-bold hover:text-sky-400 transition-colors mb-3 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Your Briefs</h1>
          <p className="text-zinc-500 text-sm mt-1">{history.length} saved {history.length === 1 ? "brief" : "briefs"}</p>
        </div>

        {/* Free plan upgrade banner */}
        {plan === "free" && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-sky-950/60 to-zinc-900/60 border border-sky-500/20 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-sm">History is a paid feature</p>
              <p className="text-zinc-400 text-xs mt-0.5">Upgrade to save and revisit all your briefs anytime.</p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 bg-sky-500 hover:bg-sky-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)]"
            >
              Upgrade →
            </Link>
          </div>
        )}

        {history.length === 0 ? (
          <div className="rounded-2xl bg-zinc-900 border border-white/5 p-12 text-center">
            <p className="text-zinc-500 text-sm">No briefs yet. Summarize a video to get started.</p>
            <Link
              href="/"
              className="inline-block mt-6 bg-sky-500 hover:bg-sky-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
            >
              Get My First Brief →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all overflow-hidden"
                >
                  {/* Card header — click to expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full text-left flex items-start gap-4 p-5"
                  >
                    {item.thumbnailUrl && (
                      <div className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-24 aspect-video object-cover rounded-xl border border-white/10"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.src.includes("hqdefault")) {
                              img.src = img.src.replace("maxresdefault", "hqdefault");
                            } else {
                              img.style.display = "none";
                            }
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm leading-snug line-clamp-2">{item.title}</p>
                      {item.takeaway && !isExpanded && (
                        <p className="text-zinc-500 text-xs mt-1.5 line-clamp-2 italic">&ldquo;{item.takeaway}&rdquo;</p>
                      )}
                      <p className="text-zinc-600 text-xs mt-2">
                        {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="shrink-0 text-zinc-500 text-lg leading-none mt-1">
                      {isExpanded ? "▲" : "▼"}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 border-t border-white/5 pt-5 space-y-5">
                      {/* Points */}
                      {item.points.map((point, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{point.heading}</p>
                            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{point.body}</p>
                          </div>
                        </div>
                      ))}

                      {/* Bottom line */}
                      {item.takeaway && (
                        <div className="rounded-xl bg-zinc-950 border border-sky-500/20 p-4">
                          <p className="text-sky-400 text-[10px] font-black tracking-widest uppercase mb-1.5">The Bottom Line</p>
                          <p className="text-zinc-400 text-xs italic leading-relaxed">&ldquo;{item.takeaway}&rdquo;</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-500 hover:text-sky-400 transition-colors underline underline-offset-2"
                        >
                          Watch on YouTube ↗
                        </a>
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/?url=${encodeURIComponent(item.url)}`}
                            className="text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors"
                          >
                            Re-brief →
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            {deletingId === item.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
