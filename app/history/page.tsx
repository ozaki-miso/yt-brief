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

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/history")
      .then((r) => r.json())
      .then((d: { history?: HistoryItem[] }) => setHistory(d.history ?? []))
      .catch(() => null)
      .finally(() => setLoading(false));
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
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="text-sky-500 text-sm font-bold hover:text-sky-400 transition-colors mb-3 inline-block">
              ← Back to home
            </Link>
            <h1 className="text-3xl font-black tracking-tight">Your Briefs</h1>
            <p className="text-zinc-500 text-sm mt-1">{history.length} saved {history.length === 1 ? "brief" : "briefs"}</p>
          </div>
        </div>

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
            {history.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all overflow-hidden"
              >
                <div className="flex items-start gap-4 p-5">
                  {item.thumbnailUrl && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
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
                    </a>
                  )}
                  <div className="flex-1 min-w-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white hover:text-sky-400 transition-colors line-clamp-2 text-sm leading-snug"
                    >
                      {item.title}
                    </a>
                    {item.takeaway && (
                      <p className="text-zinc-500 text-xs mt-1.5 line-clamp-2 italic">&ldquo;{item.takeaway}&rdquo;</p>
                    )}
                    <p className="text-zinc-600 text-xs mt-2">
                      {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Link
                      href={`/?url=${encodeURIComponent(item.url)}`}
                      className="text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors whitespace-nowrap"
                    >
                      Re-brief →
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="text-xs text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {deletingId === item.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
