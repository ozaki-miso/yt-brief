import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

console.log("Key exists:", !!process.env.OPENAI_API_KEY);

// ────────────────────────────────────────────
// プラン別の上限定義
// ────────────────────────────────────────────
const PLAN_LIMITS: Record<string, number> = {
  free: 3,      // 生涯3回
  starter: 30,  // 月30回
  pro: 100,     // 月100回
};

function currentMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

type UsageMeta = {
  usageCount?: number;
  usageMonth?: string;
  stripeCustomerId?: string;
  subscriptionId?: string | null;
};

async function checkAndIncrementUsage(userId: string): Promise<
  | { allowed: true; remaining: number }
  | { allowed: false; error: string; remaining: number }
> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const plan = (user.publicMetadata?.plan as string | undefined) ?? "free";
  const limit = PLAN_LIMITS[plan] ?? 1;
  const meta = (user.privateMetadata ?? {}) as UsageMeta;

  const month = currentMonth();
  const isFree = plan === "free";

  // Free は月リセットなし、有料プランは月ごとにリセット
  const storedMonth = meta.usageMonth ?? "";
  const count = !isFree && storedMonth !== month ? 0 : (meta.usageCount ?? 0);

  if (count >= limit) {
    return {
      allowed: false,
      error: `You have used all ${limit} ${isFree ? "" : "monthly "}summaries on the ${plan} plan. Upgrade to get more.`,
      remaining: 0,
    };
  }

  // 使用回数をインクリメント
  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...meta,
      usageCount: count + 1,
      usageMonth: month,
    },
  });

  return { allowed: true, remaining: limit - (count + 1) };
}

const SYSTEM_PROMPT = `You are a professional video analyst who writes executive-style intelligence briefs.
Your summaries are direct, specific, and immediately useful to a busy professional.

Rules:
- Adapt the number of insight points (3–5) to the density of the content:
    • Short or simple video  (<10 min or thin content) → 3 points
    • Medium video (10–30 min or moderate content)     → 4 points
    • Long or information-dense video (30+ min)        → 5 points
- Each point must have:
    • heading: a crisp 4–6 word noun phrase (no verbs, no punctuation)
    • body: exactly 2–3 sentences, 40–60 words total — enough context to understand WHY it matters, short enough to scan in under 10 seconds
- Never pad thin content just to reach 5 points. Quality over quantity.
- STRICTLY FORBIDDEN headings: "Key Insight", "Additional Insight", "Further Details", "Other Points", "Miscellaneous", or any other generic placeholder.
- STRICTLY FORBIDDEN body text: "No further detail available", "No additional information", "Not applicable", or any filler sentence.
- If you run out of genuine insights before reaching 5 points, STOP and return fewer points. 3 real insights beat 5 padded ones.
- The takeaway is one punchy, actionable sentence — the single thing worth remembering.`;

function extractVideoId(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    const h = u.hostname.toLowerCase();

    const allowed =
      h === "youtube.com" ||
      h === "www.youtube.com" ||
      h === "m.youtube.com" ||
      h === "music.youtube.com" ||
      h === "youtu.be" ||
      h === "www.youtu.be";
    if (!allowed) return null;

    if (h === "youtu.be" || h === "www.youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }

    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;

    const m =
      u.pathname.match(/\/shorts\/([\w-]{11})/) ??
      u.pathname.match(/\/embed\/([\w-]{11})/) ??
      u.pathname.match(/\/live\/([\w-]{11})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  console.log("Key exists:", !!process.env.OPENAI_API_KEY);

  // ── 認証・プラン制限チェック ──────────────────
  const { userId } = await auth();

  // 未ログインはクライアント側 localStorage で1回制限（サーバーは通過させる）
  let usageResult: { allowed: true; remaining: number } | null = null;
  if (userId) {
    const result = await checkAndIncrementUsage(userId);
    if (!result.allowed) {
      return NextResponse.json(
        { error: result.error, upgradeRequired: true },
        { status: 403 },
      );
    }
    usageResult = result;
  }
  // ─────────────────────────────────────────────

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 503 },
    );
  }

  let url: string;
  try {
    const body = await request.json() as { url?: unknown };
    url = typeof body.url === "string" ? body.url.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      { error: "Please enter a valid YouTube URL (youtube.com or youtu.be)." },
      { status: 400 },
    );
  }

  let transcriptText: string;
  const supadataApiKey = process.env.SUPADATA_API_KEY;

  if (supadataApiKey) {
    // 本番: Supadata で字幕取得
    try {
      const res = await fetch(
        `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`,
        {
          headers: {
            "x-api-key": supadataApiKey,
          },
        },
      );
      if (!res.ok) throw new Error(`Supadata ${res.status}`);
      const data = await res.json() as { content?: string };
      if (!data.content) throw new Error("No transcript content returned");
      transcriptText = data.content.replace(/\s+/g, " ").trim();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("Supadata transcript fetch failed:", msg);
      return NextResponse.json(
        { error: "Captions are not available for this video. Try a video that has subtitles/CC enabled." },
        { status: 404 },
      );
    }
  } else {
    // ローカル開発: youtube-transcript で字幕取得
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = segments
        .map((s) => s.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("Transcript fetch failed:", msg);
      return NextResponse.json(
        { error: "Captions are not available for this video. Try a video that has subtitles/CC enabled." },
        { status: 404 },
      );
    }
  }

  if (transcriptText.length < 30) {
    return NextResponse.json(
      { error: "The transcript for this video is too short to summarize." },
      { status: 404 },
    );
  }

  const openai = new OpenAI({ apiKey });

  let raw: string;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `Video URL: https://www.youtube.com/watch?v=${videoId}`,
            "",
            "Transcript (may be truncated):",
            transcriptText.slice(0, 10_000),
            "",
            "Produce a high-value intelligence brief adapted to this video's length and density.",
            "Return ONLY valid JSON — no markdown, no extra keys:",
            `{
  "title": "<descriptive title, max 10 words>",
  "points": [
    { "heading": "<4-6 word noun phrase>", "body": "<2-3 sentences, 40-60 words>" }
    // include 3, 4, or 5 points depending on content density
  ],
  "takeaway": "<one punchy actionable sentence>"
}`,
          ].join("\n"),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 900,
    });
    raw = completion.choices[0]?.message?.content ?? "";
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OpenAI error";
    console.error("OpenAI error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(raw) as {
      title?: unknown;
      points?: unknown;
      takeaway?: unknown;
    };

    const title = typeof parsed.title === "string" ? parsed.title : "Video Summary";
    const takeaway =
      typeof parsed.takeaway === "string" ? parsed.takeaway.trim() : null;

    const FILLER_HEADINGS = ["key insight", "additional insight", "further details", "other points", "miscellaneous"];
    const FILLER_BODIES = ["no further detail available", "no additional information", "not applicable", "no detail available"];

    type RawPoint = { heading?: unknown; body?: unknown };
    const rawPoints: RawPoint[] = Array.isArray(parsed.points)
      ? (parsed.points as RawPoint[])
      : [];

    const points = rawPoints
      .slice(0, 5)
      .map((p) => ({
        heading: typeof p.heading === "string" ? p.heading.trim() : "",
        body: typeof p.body === "string" ? p.body.trim() : "",
      }))
      .filter((p) =>
        p.heading &&
        p.body &&
        !FILLER_HEADINGS.includes(p.heading.toLowerCase()) &&
        !FILLER_BODIES.some((f) => p.body.toLowerCase().startsWith(f)),
      );

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    return NextResponse.json({
      url,
      title,
      points,
      takeaway,
      thumbnailUrl,
      remaining: usageResult?.remaining ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not parse the AI response." },
      { status: 502 },
    );
  }
}
