import Link from "next/link";

export const metadata = { title: "Refund Policy | YT-brief" };

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sky-500 text-sm font-bold hover:text-sky-400 transition-colors">
          ← Back to YT-brief
        </Link>

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight mb-2">Refund Policy</h1>
        <p className="text-zinc-500 text-sm mb-12">Last updated: May 14, 2026</p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-xl mb-3">1. No Refund Policy</h2>
            <p>All purchases of paid subscription plans on YT-brief are <span className="text-white font-semibold">strictly non-refundable</span>. By completing a purchase, you explicitly acknowledge and accept that no refunds will be issued under any circumstances, except where required by applicable law.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. Monthly Subscriptions</h2>
            <p>Monthly subscriptions are billed at the start of each billing period. No refunds will be provided for partial months, unused summaries, or any portion of a billing period, regardless of usage. You may cancel at any time; cancellation takes effect at the end of the current billing cycle.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. Chargebacks and Disputes</h2>
            <p>By using the Service, you agree to contact us at <span className="text-sky-400">takuya08080804@gmail.com</span> before initiating any chargeback or payment dispute with your card issuer. Any chargeback filed without prior contact may result in immediate account termination.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Cancellation</h2>
            <p>You may cancel your subscription at any time from your account settings. After cancellation, your account reverts to the Free plan at the end of the billing cycle. No credits or refunds are provided for the remaining period.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. Service Outage Exception</h2>
            <p>In the rare event that YT-brief experiences a complete service outage caused solely by issues within our direct control — rendering the Service entirely inaccessible for an extended period — we may, at our sole discretion, issue a refund via Stripe for the affected billing period. To request consideration, contact us at <span className="text-sky-400">takuya08080804@gmail.com</span> within 14 days of the outage. Outages caused by third-party infrastructure providers are not eligible.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">6. Acknowledgment</h2>
            <p>By completing a purchase, you confirm that you have read, understood, and agreed to this Refund Policy. If you do not agree, do not subscribe.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex gap-6 text-xs text-zinc-600">
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
