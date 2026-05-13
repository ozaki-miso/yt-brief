import Link from "next/link";

export const metadata = { title: "Privacy Policy – YT-brief" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sky-500 text-sm font-bold hover:text-sky-400 transition-colors">
          ← Back to YT-brief
        </Link>

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-12">Last updated: May 14, 2026</p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-xl mb-3">1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li><span className="text-white font-medium">Account information</span> — name, email address, and profile data provided when you sign up via Clerk.</li>
              <li><span className="text-white font-medium">Usage data</span> — number of summaries used, subscription plan, and usage timestamps stored in your account metadata.</li>
              <li><span className="text-white font-medium">Payment information</span> — billing details are processed and stored securely by Stripe. We do not store credit card numbers on our servers.</li>
              <li><span className="text-white font-medium">YouTube URLs</span> — URLs you submit are used solely to fetch publicly available captions and generate summaries. We do not store submitted URLs or generated summaries.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>Provide and maintain the Service</li>
              <li>Process payments and manage your subscription</li>
              <li>Enforce usage limits based on your plan</li>
              <li>Send important notices about your account or the Service</li>
              <li>Improve the quality and performance of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. Third-Party Services</h2>
            <p>We use the following third-party services, each with their own privacy policies:</p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-zinc-400">
              <li><span className="text-white font-medium">Clerk</span> — authentication and user management. <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">clerk.com/privacy</a></li>
              <li><span className="text-white font-medium">Stripe</span> — payment processing. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">stripe.com/privacy</a></li>
              <li><span className="text-white font-medium">RapidAPI / YouTube</span> — caption retrieval from publicly available video data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Data Retention</h2>
            <p>We retain your account information for as long as your account is active. Usage counters and subscription metadata are stored in your account and deleted when you close your account. We do not retain video URLs or summaries after your session ends.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. To request data deletion, please contact us at <span className="text-sky-400">support@yt-brief.com</span>. You may also delete your account directly from your account settings.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">6. Cookies</h2>
            <p>We use essential cookies required for authentication and session management. We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">7. Children&apos;s Privacy</h2>
            <p>The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">9. Contact</h2>
            <p>For any privacy-related questions, please contact us at <span className="text-sky-400">support@yt-brief.com</span>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex gap-6 text-xs text-zinc-600">
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
          <Link href="/refund" className="hover:text-zinc-400 transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
