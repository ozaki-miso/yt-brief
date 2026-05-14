import Link from "next/link";

export const metadata = { title: "Refund Policy – YT-brief" };

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
            <h2 className="text-white font-bold text-xl mb-3">1. General Policy</h2>
            <p>All purchases of paid subscription plans on YT-brief are <span className="text-white font-semibold">non-refundable</span> unless otherwise stated in this policy or required by applicable law. By subscribing to a paid plan, you acknowledge and agree to this refund policy.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. Monthly Subscriptions</h2>
            <p>Monthly subscriptions are billed at the start of each billing period. We do not provide refunds for partial months or unused summaries within a billing period. You may cancel your subscription at any time, and access will continue until the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. Cancellation</h2>
            <p>You may cancel your subscription at any time from your account settings. Cancellation is effective at the end of the current billing cycle. After cancellation, your account will revert to the Free plan and you will retain access to 3 lifetime summaries.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Exceptions</h2>
            <p>We may, at our sole discretion, issue a refund in the following circumstances:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>You were charged in error (e.g., duplicate charge)</li>
              <li>The Service was completely unavailable for an extended period (&gt;72 hours) due to issues solely within our direct control (excludes third-party infrastructure outages)</li>
              <li>Applicable consumer protection law in your jurisdiction requires a refund</li>
            </ul>
            <p className="mt-3">To request a refund under these circumstances, contact us at <span className="text-sky-400">support@yt-brief.com</span> within 7 days of the charge.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. Service Discontinuation</h2>
            <p>In the event that YT-brief discontinues the Service entirely, we will endeavor to provide reasonable advance notice where possible. As all plans are billed monthly with no prepayment beyond the current period, no pro-rated refunds are owed upon discontinuation.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">6. Contact</h2>
            <p>For refund requests or billing questions, please contact us at <span className="text-sky-400">support@yt-brief.com</span>. Please include your account email and the date of the charge in your message.</p>
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
