import Link from "next/link";

export const metadata = { title: "特定商取引法に基づく表記 – YT-brief" };

export default function TokushoPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sky-500 text-sm font-bold hover:text-sky-400 transition-colors">
          ← Back to YT-brief
        </Link>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight mb-2">特定商取引法に基づく表記</h1>
        <p className="text-zinc-500 text-sm mb-12">最終更新日：2026年5月14日</p>

        <div className="divide-y divide-white/10">
          {[
            { label: "販売業者", value: "YT-brief" },
            { label: "運営責任者", value: "YT-brief" },
            {
              label: "所在地",
              value: "請求があった場合、遅滞なく開示します。メールにてお問い合わせください。",
            },
            {
              label: "電話番号",
              value: "請求があった場合、遅滞なく開示します。先にメールにてお問い合わせください。",
            },
            { label: "メールアドレス", value: "support@yt-brief.com" },
            { label: "サービス名", value: "YT-brief" },
            { label: "サービス内容", value: "YouTube動画の自動要約サービス（月額サブスクリプション）" },
            {
              label: "販売価格",
              value: (
                <ul className="space-y-1">
                  <li>Free プラン：無料（生涯3回まで）</li>
                  <li>Starter プラン：$4.99 / 月（月30回）</li>
                  <li>Pro プラン：$8.99 / 月（月100回）</li>
                  <li>※価格は米ドル表示。カード会社の為替レートにより円換算額は変動します。</li>
                </ul>
              ),
            },
            { label: "支払方法", value: "クレジットカード（Visa・Mastercard・American Express 他）/ Stripe 決済" },
            { label: "支払時期", value: "サブスクリプション登録時に初回決済。以降、毎月同日に自動更新。" },
            { label: "サービス提供時期", value: "決済完了後、即時利用可能。" },
            {
              label: "キャンセル・解約",
              value: "アカウント設定画面よりいつでも解約可能。解約後は当該月末まで利用継続でき、翌月以降の請求は発生しません。",
            },
            {
              label: "返金について",
              value: (
                <span>
                  原則として返金は行いません。ただし、当社側の技術的障害によりサービスが完全に停止した場合は、Stripe 経由での返金対応を行うことがあります。詳細は{" "}
                  <Link href="/refund" className="text-sky-400 hover:underline">返金ポリシー</Link>
                  {" "}をご確認ください。
                </span>
              ),
            },
            { label: "動作環境", value: "インターネット接続環境および最新バージョンのWebブラウザ（Chrome・Safari・Firefox・Edge）" },
          ].map(({ label, value }) => (
            <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-5">
              <dt className="text-zinc-400 font-medium text-sm shrink-0">{label}</dt>
              <dd className="sm:col-span-2 text-zinc-200 text-sm leading-relaxed">{value}</dd>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-xs text-zinc-600">
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-zinc-400 transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
