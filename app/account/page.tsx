"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const PLAN_LABELS: Record<string, { label: string; color: string; limit: number; limitLabel: string }> = {
  free:    { label: "Free",    color: "text-zinc-400",   limit: 3,   limitLabel: "3 summaries (lifetime)" },
  starter: { label: "Starter", color: "text-sky-400",    limit: 30,  limitLabel: "30 summaries / month" },
  pro:     { label: "Pro",     color: "text-indigo-400", limit: 100, limitLabel: "100 summaries / month" },
};

type AccountData = {
  plan: string;
  usageCount: number;
  remaining: number;
  limit: number;
};

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/account")
      .then((r) => r.json())
      .then((d: AccountData) => setAccountData(d))
      .catch(() => null);
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">Please sign in to view your account.</p>
          <Link href="/" className="text-sky-400 hover:underline text-sm">← Back to home</Link>
        </div>
      </div>
    );
  }

  const plan = accountData?.plan ?? "free";
  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.free;
  const usageCount = accountData?.usageCount ?? 0;
  const remaining = accountData?.remaining ?? 0;

  async function openPortal() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(data.error ?? "Could not open billing portal.");
        setPortalLoading(false);
      }
    } catch {
      setPortalError("Network error. Please try again.");
      setPortalLoading(false);
    }
  }

  const usagePct = planInfo.limit > 0
    ? Math.min(100, (usageCount / planInfo.limit) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-5 max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_0_16px_rgba(56,189,248,0.45)]">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <path d="M7 5.5l8 4.5-8 4.5V5.5z" fill="white" />
              <path d="M3 14.5h5M3 16.5h3" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black tracking-tight text-white leading-none">YT</span>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent leading-none">brief</span>
          </div>
        </Link>
        <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-5">
        <h1 className="text-2xl font-extrabold tracking-tight">My Account</h1>

        {/* Profile */}
        <div className="bg-zinc-900 rounded-2xl border border-white/[0.08] p-6 flex items-center gap-4">
          {user.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt="Profile photo" className="w-14 h-14 rounded-full" />
          )}
          <div>
            <p className="font-bold text-lg leading-tight">{user.fullName ?? user.username ?? "—"}</p>
            <p className="text-zinc-400 text-sm mt-0.5">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-zinc-900 rounded-2xl border border-white/[0.08] p-6 space-y-4">
          <h2 className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Current Plan</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-extrabold ${planInfo.color}`}>{planInfo.label}</span>
                {plan !== "free" && (
                  <span className="text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                )}
              </div>
              <p className="text-zinc-500 text-sm mt-1">{planInfo.limitLabel}</p>
            </div>
            {plan === "free" ? (
              <Link
                href="/pricing"
                className="shrink-0 text-sm font-bold bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)]"
              >
                Upgrade →
              </Link>
            ) : (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="shrink-0 text-sm font-bold border border-white/15 text-zinc-300 px-5 py-2.5 rounded-xl hover:border-white/40 hover:text-white transition-all disabled:opacity-50"
              >
                {portalLoading ? "Opening..." : "Manage Subscription"}
              </button>
            )}
          </div>
          {portalError && <p className="text-red-400 text-sm">{portalError}</p>}
        </div>

        {/* Usage */}
        <div className="bg-zinc-900 rounded-2xl border border-white/[0.08] p-6 space-y-4">
          <h2 className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
            Usage {plan === "free" ? "(Lifetime)" : "(This Month)"}
          </h2>
          {accountData ? (
            <>
              <div className="flex items-end justify-between">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-white">{usageCount}</span>
                  <span className="text-zinc-500 text-sm pb-1">of {planInfo.limit} used</span>
                </div>
                <span className={`text-sm font-bold ${remaining === 0 ? "text-amber-400" : "text-sky-400"}`}>
                  {remaining} remaining
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${remaining === 0 ? "bg-amber-500" : "bg-gradient-to-r from-sky-500 to-indigo-500"}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              {remaining === 0 && plan === "free" && (
                <p className="text-sm text-zinc-400">
                  You&apos;ve used all free summaries.{" "}
                  <Link href="/pricing" className="text-sky-400 hover:underline">Upgrade to get more →</Link>
                </p>
              )}
              {remaining === 0 && plan !== "free" && (
                <p className="text-sm text-zinc-400">Monthly limit reached. Resets on the 1st of next month.</p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          )}
        </div>

        {/* Back */}
        <div className="pt-2">
          <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
            ← Back to YT-brief
          </Link>
        </div>
      </main>
    </div>
  );
}
