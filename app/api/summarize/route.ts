import { NextResponse } from "next/server";
import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // 1. YouTube IDの抽出
    const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
    
    // 2. 字幕の取得（ここが難関）
    let transcriptText = "";
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      // 負荷軽減のため最初の2500文字程度を使用
      transcriptText = transcript.map(t => t.text).join(" ").slice(0, 2500);
    } catch (e: any) {
      console.error("Transcript Error:", e);
      return NextResponse.json({ error: "字幕の取得に失敗しました。動画の設定を確認してください。" }, { status: 500 });
    }

    // 3. OpenAIで要約（gpt-4o-miniで高速化）
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "あなたはプロの動画要約家です。提供された字幕から、動画の核心を突く3つの要点を日本語で作成してください。" 
        },
        { role: "user", content: transcriptText }
      ],
    });

    // 4. 結果を返す
    const content = completion.choices[0].message.content || "";
    const points = content.split('\n').filter(p => p.trim().length > 0);

    return NextResponse.json({ points });

  } catch (error: any) {
    console.error("Summarize Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}