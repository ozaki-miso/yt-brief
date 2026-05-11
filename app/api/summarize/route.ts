import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // YouTube IDの抽出（より精度の高い正規表現を使用）
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;

    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube ID" }, { status: 400 });
    }

    // RapidAPIの設定
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'youtube-transcripts.p.rapidapi.com'
      }
    };

    // YouTube動画のフルURLを作成し、エンコードしてAPIに渡す
    const targetVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const apiUrl = `https://youtube-transcripts.p.rapidapi.com/youtube/transcript?url=${encodeURIComponent(targetVideoUrl)}`;
    
    console.log("Fetching from RapidAPI:", apiUrl);

    const response = await fetch(apiUrl, options);
    
    // ここで一度だけ JSON をパースする（重複宣言を削除）
    const data = await response.json();

    if (!response.ok) {
      console.error("RapidAPI Error Response:", data);
      return NextResponse.json({ error: "API_REJECTED", detail: data }, { status: response.status });
    }

    // APIの返却形式（data.content または data.transcript）からテキストを取得
    const transcriptText = data.content || data.transcript || ""; 

    if (!transcriptText) {
      return NextResponse.json({ error: "No transcript content found" }, { status: 404 });
    }

    // OpenAIで要約
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a professional summarizer. Summarize in English with 3 punchy bullet points." 
        },
        { role: "user", content: transcriptText.slice(0, 6000) }
      ],
    });

    const points = completion.choices[0].message.content?.split('\n').filter(p => p.trim()) || [];
    
    return NextResponse.json({ points });

  } catch (error: any) {
    console.error("Final catch error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}