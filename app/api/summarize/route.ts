import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // 1. YouTube IDの抽出 (ドキュメント推奨のvideoIdを優先使用するため)
    const videoId = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
    if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

    // 2. RapidAPI (Supadata) へのリクエスト
    // ドキュメントに従い、text=true を追加して「平文」を直接取得します
    const apiUrl = `https://youtube-transcripts.p.rapidapi.com/youtube/transcript?videoId=${videoId}&text=true`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'youtube-transcripts.p.rapidapi.com'
      }
    });

    const data = await response.json();

    // ドキュメントにあるエラー応答構造に対応
    if (!response.ok) {
      console.error("Supadata API Error:", data);
      const errorMsg = data.error || data.message || "字幕の取得に失敗しました";
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    // text=true を指定した場合、data.content に平文が入ります
    const transcriptText = data.content || "";

    if (!transcriptText || transcriptText.length < 20) {
      return NextResponse.json({ error: "字幕データが取得できませんでした。動画の設定を確認してください。" }, { status: 404 });
    }

    // 3. OpenAIで要約 (最新の標準的なメッセージ形式)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize the transcript in 3 concise English bullet points." },
        { role: "user", content: transcriptText.slice(0, 8000) }
      ],
      temperature: 0.5
    });

    const points = completion.choices[0].message.content?.split('\n').filter(p => p.trim()) || [];
    return NextResponse.json({ points });

  } catch (error: any) {
    console.error("Final System Error:", error.message);
    return NextResponse.json({ error: "予期せぬエラーが発生しました" }, { status: 500 });
  }
}