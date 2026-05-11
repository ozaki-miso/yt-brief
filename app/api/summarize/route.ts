import { NextResponse } from "next/server";
import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";
export const runtime = "nodejs";
function getOpenAiEnvDiagnostics() {
  const relatedKeys = Object.keys(process.env)
    .filter((k) => k.toUpperCase().includes("OPENAI"))
    .sort();

  return {
    openaiApiKeyPresent: Boolean(process.env.OPENAI_API_KEY),
    /** Length only — never log or return the secret value. */
    openaiApiKeyLength: process.env.OPENAI_API_KEY?.length ?? 0,
    nodeEnv: process.env.NODE_ENV ?? null,
    nextRuntime: process.env.NEXT_RUNTIME ?? null,
    vercel: process.env.VERCEL === "1",
    vercelEnv: process.env.VERCEL_ENV ?? null,
    relatedEnvKeys: relatedKeys.map((name) => ({
      name,
      isSet: Boolean(process.env[name]),
    })),
  };
}

const SYSTEM_PROMPT = `You are a savvy tech curator. 
Summarize this video briefly. 
Return ONLY JSON with "overview" and "bullets" (max 5).`;
const OPENAI_MODEL = "gpt-4o-mini" as const;

function isAllowedYouTubeHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "youtube.com" ||
    h === "www.youtube.com" ||
    h === "m.youtube.com" ||
    h === "music.youtube.com" ||
    h === "www.youtube-nocookie.com" ||
    h === "youtube-nocookie.com" ||
    h === "youtu.be" ||
    h === "www.youtu.be"
  );
}

function extractVideoId(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    if (!isAllowedYouTubeHost(u.hostname)) return null;

    if (u.hostname === "youtu.be" || u.hostname === "www.youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;

    const shorts = u.pathname.match(/\/shorts\/([\w-]{11})/);
    if (shorts) return shorts[1];

    const embed = u.pathname.match(/\/embed\/([\w-]{11})/);
    if (embed) return embed[1];

    const live = u.pathname.match(/\/live\/([\w-]{11})/);
    if (live) return live[1];

    return null;
  } catch {
    return null;
  }
}

function parseSummaryJson(raw: string): { title: string; bullets: string[] } {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  }
  const parsed = JSON.parse(text) as { title?: unknown; bullets?: unknown };
  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  const bullets = Array.isArray(parsed.bullets)
    ? parsed.bullets.filter((b): b is string => typeof b === "string").map((b) => b.trim())
    : [];
  return { title, bullets };
}

function normalizePoints(bullets: string[]): [string, string, string] {
  const padded = [...bullets];
  while (padded.length < 3) {
    padded.push("Further detail was not emphasized in the available transcript.");
  }
  return [padded[0], padded[1], padded[2]];
}

export async function POST(request: Request) {
  // 1. 環境変数の取得
  const apiKey = process.env.OPENAI_API_KEY;

  // 2. デバッグ用ログ（サーバーのターミナルに表示されます）
  console.log("--- API Key Debug ---");
  console.log("Key defined:", !!apiKey);
  if (apiKey) {
    console.log("Key starts with:", apiKey.substring(0, 7)); // sk-proj まで表示
  }
  console.log("---------------------");

  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      {
        error: "APIキーが読み込めていません。.env.local ファイルを確認して、npm run dev を再起動してください。",
        envStatus: "missing",
      },
      { status: 503 }
    );
  }

  // ここから下の処理（bodyの取得など）に続く...

  // 1. リクエストボディの取得
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const url = body?.url?.trim() || "";
  if (!url) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  // 2. URLの正規化とID抽出
  let normalized: string;
  try {
    normalized = new URL(url.startsWith("http") ? url : `https://${url}`).toString();
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  const videoId = extractVideoId(normalized);
  if (!videoId) {
    return NextResponse.json({ error: "Invalid or unsupported YouTube URL." }, { status: 400 });
  }

  // 3. 字幕の取得
  let transcriptText: string;
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    transcriptText = segments
      .map((s) => s.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Transcript unavailable.";
    return NextResponse.json({ error: `Could not load captions: ${message}` }, { status: 404 });
  }

  if (!transcriptText) {
    return NextResponse.json({ error: "No caption text found." }, { status: 404 });
  }

  const transcriptForModel = transcriptText.slice(0, 50000);

  // 4. OpenAIリクエスト（1回に集約）
  const openai = new OpenAI({ apiKey });
  let content: string = "";

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `Video URL: ${normalized}`,
            "",
            "Transcript:",
            transcriptForModel,
            "",
            "Final Instructions:",
            "- Naturally determine the number of points (3 to 8).",
            "- Use English for EVERYTHING (Title and Bullets).",
            "- Format: 'HEADLINE: Description'.",
            "- Return valid JSON ONLY: ",
            '{"title":"<Title>","bullets":["HEADLINE: Insight..."]}',
          ].join("\n"),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.35,
    });
    content = completion.choices[0]?.message?.content ?? "";
  } catch (e) {
    const message = e instanceof Error ? e.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (!content) {
    return NextResponse.json({ error: "Empty model response." }, { status: 502 });
  }

  // 5. 結果のパースと返却
  try {
    const parsed = parseSummaryJson(content);
    if (!parsed.title || !parsed.bullets || parsed.bullets.length === 0) {
      return NextResponse.json({ error: "Insufficient data." }, { status: 502 });
    }

    return NextResponse.json({
      url: normalized,
      title: parsed.title,
      points: parsed.bullets,
    });
  } catch (e) {
    return NextResponse.json({ error: "JSON parse error." }, 
      { status: 502 }
    );
  }
}