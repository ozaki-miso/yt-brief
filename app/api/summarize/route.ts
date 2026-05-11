import { NextResponse } from "next/server";
import OpenAI from "openai";

// Vercelのキャッシュやタイムアウトを防ぐ設定
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // 1. YouTube IDを正規表現で厳密に抽出
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;

    if (!videoId) {
      return NextResponse.json({ error: "YouTubeのURLが正しくありません。" }, { status: 400 });
    }

    // 2. RapidAPI (youtube-transcripts) から字幕を取得
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      return NextResponse.json({ error: "RAPIDAPI_KEYが設定されていません。" }, { status: 500 });
    }

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'youtube-transcripts.p.rapidapi.com'
      }
    };

    // エンコード済みのフルURLを作成
    const targetVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const apiUrl = `https://youtube-transcripts.p.rapidapi.com/youtube/transcript?url=${encodeURIComponent(targetVideoUrl)}`;
    
    const response = await fetch(apiUrl, options);
    const data = await response.json();

    if (!response.ok) {
      console.error("RapidAPI Error Detail:", data);
      return NextResponse.json({ error: "字幕の取得に失敗しました。", detail: data }, { status: response.status });
    }

    // 字幕テキストを安全に取得
    const transcriptText = data.content || data.transcript || ""; 
    if (!transcriptText || transcriptText.length < 10) {
      return NextResponse.json({ error: "この動画には字幕データが存在しないか、取得できませんでした。" }, { status: 404 });
    }

    // 3. OpenAIで要約 (エラーの出ない最新のメッセージ形式を適用)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEYが設定されていません。" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    // エラー「Missing required parameter: 'messages[1].content[0].type'」を回避する厳格な形式
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a professional video summarizer. Provide 3 punchy bullet points in English." 
        },
        { 
          role: "user", 
          content: transcriptText.slice(0, 8000) // 以前のミスを修正: 文字列をそのまま渡す（またはオブジェクト形式を完璧にする）
        }
      ],
    });

    const summaryContent = completion.choices[0].message.content || "";
    const points = summaryContent.split('\n').filter(p => p.trim() !== "");
    
    return NextResponse.json({ points });

  } catch (error: any) {
    console.error("Critical Error:", error.message);
    return NextResponse.json({ error: "サーバー内で予期せぬエラーが発生しました。", detail: error.message }, { status: 500 });
  }
}