import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();

    if (!videoId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const options = {
      method: 'GET',
      headers: {
        // Vercelの設定に合わせてここを確認
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '1f9aca7cffmsh9e269b6c2d1b848p13966bjsnfaea7bdd643b',
        // 画像に書いてあった正確なホスト名に変更
        'X-RapidAPI-Host': 'youtube-transcripts.p.rapidapi.com' 
      }
    };

    // fetchするURLも画像のスニペットに合わせて微調整
    const apiUrl = `https://youtube-transcripts.p.rapidapi.com/youtube/transcript?url=https://www.youtube.com/watch?v=${videoId}&chunkSize=500`;
    
    const response = await fetch(apiUrl, options);
    
    if (!response.ok) {
      const errorDetail = await response.text();
      console.error("RapidAPI Error:", errorDetail);
      return NextResponse.json({ error: "API_REJECTED", detail: errorDetail }, { status: response.status });
    }

    const data = await response.json();
    // APIの返却形式に合わせてテキストを結合
    const transcriptText = data.content || data.transcript || ""; 

    if (!transcriptText) {
      return NextResponse.json({ error: "No transcript content" }, { status: 404 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize this in English with 3 bullet points." },
        { role: "user", content: transcriptText.slice(0, 5000) }
      ],
    });

    const points = completion.choices[0].message.content?.split('\n').filter(p => p.trim()) || [];
    return NextResponse.json({ points });

  } catch (error: any) {
    console.error("Final catch error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}