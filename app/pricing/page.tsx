"use client";

import Link from "next/link";
import { useState } from "react";

type Billing = "monthly" | "yearly";

type BasePlan = {
  id: "free" | "starter" | "pro";
  name: string;
  description: string;
  features: readonly string[];
};

type FreePlan = BasePlan & {
  id: "free";
};

type PaidPlan = BasePlan & {
  id: "starter" | "pro";
  monthlyPrice: string;
  yearlyMonthlyEquivalent: string;
  yearlyBilledTotal: string;
  badge?: string;
};

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Experience the power of instant insights.",
    features: [
      "Your first brief is on us",
      "No account or card required",
      "High-quality condensed output",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: "$12.99",
    yearlyMonthlyEquivalent: "$10.39",
    yearlyBilledTotal: "$124.71 billed yearly",
    description: "Ideal for students and casual learners.",
    features: [
      "30 summaries every month",
      "Summarize videos of any length",
      "Standard processing speed",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    monthlyPrice: "$19.99",
    yearlyMonthlyEquivalent: "$15.99",
    yearlyBilledTotal: "$191.90 billed yearly",
    description: "For professionals who value their time.",
    features: [
      "UNLIMITED summaries", 
      "Priority instant processing", 
      "Early access to new features"
    ],
  },
] as const satisfies readonly (FreePlan | PaidPlan)[];

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-[18px] w-[18px] shrink-0 text-emerald-400/95"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#07070d] text-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.9]"
        aria-hidden
        style={{
          background:
            "radial-gradient(1200px 600px at 12% -10%, rgb(99 102 241 / 0.18), transparent 55%), radial-gradient(900px 500px at 88% -5%, rgb(14 165 233 / 0.16), transparent 50%), radial-gradient(800px 480px at 50% 100%, rgb(236 72 153 / 0.08), transparent 55%), linear-gradient(180deg, #07070d, #090912 45%, #07070d)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.085)'/%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 pb-20 pt-10 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[11px] font-semibold tracking-[0.2em] text-white/80 transition-colors group-hover:border-white/25">
              Yt
            </span>
            <span className="tracking-tight">YT-brief</span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
          >
            Back to summary
          </Link>
        </header>

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
            Pricing
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.05]">
            Simple Pricing for Endless Insights
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
            Stop wasting time on long videos. Choose a plan and start summarizing
            in seconds.
          </p>

          <div className="mt-10 inline-flex rounded-full border border-white/12 bg-black/35 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
            <button
              type="button"
              aria-pressed={billing === "monthly"}
              onClick={() => setBilling("monthly")}
              className={`relative rounded-full px-6 py-2 text-sm font-semibold transition-[color] ${
                billing === "monthly"
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {billing === "monthly" ? (
                <span className="absolute inset-0 rounded-full bg-white/[0.085] shadow-[0_14px_40px_-30px_rgb(147_197_253/0.85)] ring-1 ring-white/15" />
              ) : null}
              <span className="relative">Monthly</span>
            </button>
            <button
              type="button"
              aria-pressed={billing === "yearly"}
              onClick={() => setBilling("yearly")}
              className={`relative rounded-full px-6 py-2 text-sm font-semibold transition-[color] ${
                billing === "yearly"
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {billing === "yearly" ? (
                <span className="absolute inset-0 rounded-full bg-white/[0.085] shadow-[0_14px_40px_-28px_rgb(236_233_254/0.9)] ring-1 ring-white/15" />
              ) : null}
              <span className="relative flex items-center gap-2">
                Yearly
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-200/90 ring-1 ring-emerald-400/30">
                  Save 20%
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan) => {
            const isPro = plan.id === "pro";
            const isPaid = plan.id !== "free";
            const paidPlan = plan as PaidPlan;

            const priceDisplay =
              plan.id === "free"
                ? { main: "$0", suffix: "forever", footnote: null as string | null }
                : {
                    main:
                      billing === "monthly"
                        ? paidPlan.monthlyPrice
                        : paidPlan.yearlyMonthlyEquivalent,
                    suffix: "/month",
                    footnote:
                      billing === "yearly"
                        ? paidPlan.yearlyBilledTotal
                        : ("Billed monthly · cancel anytime" as string),
                  };

            const cardInner = (
              <div
                className={`relative flex h-full flex-col rounded-[26px] border bg-gradient-to-b p-8 ${
                  isPro
                    ? "border-white/12 from-zinc-950/95 to-zinc-950/45"
                    : "border-white/[0.08] from-zinc-950/75 to-zinc-950/35"
                } shadow-[0_40px_120px_-60px_rgba(0,0,0,0.78)] backdrop-blur-xl`}
              >
                {isPro && paidPlan.badge ? (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full border border-indigo-300/30 bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/25 to-emerald-400/25 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-50 shadow-[0_12px_40px_-25px_rgb(129_140_248/0.9)]">
                      {paidPlan.badge}
                    </span>
                  </div>
                ) : null}

                <div className={isPro ? "pt-2" : ""}>
                  <p className="text-sm font-medium text-zinc-400">{plan.name}</p>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold tracking-tight text-white sm:text-[2.75rem]">
                      {priceDisplay.main}
                    </span>
                    <span className="text-sm text-zinc-500">{priceDisplay.suffix}</span>
                  </div>
                  {priceDisplay.footnote ? (
                    <p className="mt-2 text-xs text-zinc-500">{priceDisplay.footnote}</p>
                  ) : null}

                  <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-8 flex-1 space-y-3.5">
                  {plan.features.map((feature) => {
                    const isUnlimitedHighlight =
                      isPro && feature === "UNLIMITED summaries";
                    return (
                      <li
                        key={feature}
                        className={
                          isUnlimitedHighlight
                            ? "flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent px-4 py-3.5 text-[15px] leading-snug shadow-[0_16px_50px_-35px_rgb(16_185_129/0.65)]"
                            : "flex items-start gap-3 text-[15px] leading-snug text-zinc-100"
                        }
                      >
                        <CheckIcon />
                        {isUnlimitedHighlight ? (
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
                              Core benefit
                            </p>
                            <p className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
                              <span className="bg-gradient-to-r from-emerald-200 via-white to-emerald-100 bg-clip-text text-transparent">
                                UNLIMITED
                              </span>{" "}
                              <span className="text-zinc-100">summaries</span>
                            </p>
                            <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
                              No caps, no throttling—get briefs as fast as you
                              find videos worth watching.
                            </p>
                          </div>
                        ) : (
                          <span>{feature}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-10">
                  <button
                    type="button"
                    className={
                      isPro
                        ? "w-full rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-4 py-[14px] text-[15px] font-semibold text-white shadow-[0_26px_70px_-32px_rgb(129_140_248/0.9),0_18px_50px_-38px_rgb(217_70_239/0.55)] ring-1 ring-white/30 transition-[filter,transform] hover:brightness-110 active:translate-y-[0.5px]"
                        : isPaid
                          ? "w-full rounded-xl border border-white/16 bg-white/[0.065] px-4 py-[14px] text-[15px] font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.1]"
                          : "w-full rounded-xl border border-white/12 bg-transparent px-4 py-[14px] text-[15px] font-semibold text-zinc-50 transition-colors hover:border-white/20 hover:bg-white/[0.035]"
                    }
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            );

            if (!isPro) {
              return (
                <article key={plan.id} className="relative">
                  <div className="absolute inset-[2px] rounded-[28px] bg-gradient-to-b from-white/[0.07] via-transparent to-transparent opacity-65 blur-xl" />
                  <div className="relative">{cardInner}</div>
                </article>
              );
            }

            return (
              <article key={plan.id} className="relative">
                <div
                  className="pointer-events-none absolute -inset-px rounded-[29px] bg-gradient-to-br from-indigo-400/65 via-violet-400/50 to-emerald-300/60 opacity-95"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -inset-3 rounded-[36px] opacity-75"
                  aria-hidden
                  style={{
                    background:
                      "conic-gradient(from 120deg, rgb(165 180 252 / 0.35), rgb(192 132 252 / 0.28), rgb(52 211 153 / 0.32), rgb(147 197 253 / 0.3), rgb(165 180 252 / 0.35))",
                    filter: "blur(19px)",
                  }}
                />
                <div className="relative rounded-[29px] p-px shadow-[0_34px_120px_-54px_rgb(147_112_246/0.65)] ring-1 ring-white/12 ring-offset-[6px] ring-offset-[#07070d]">
                  <div className="rounded-[28px] bg-gradient-to-b from-white/[0.15] via-white/[0.04] to-transparent p-px">
                    {cardInner}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="mt-14 text-center">
          <p className="text-[13px] text-zinc-600">
            Secure payments powered by Stripe. You can cancel your plan at any time.
          </p>
        </footer>
      </div>
    </div>
  );
}