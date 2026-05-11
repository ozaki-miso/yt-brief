import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();

    if (!videoId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // 1. RapidAPIを使用して字幕を取得 (ここが重要！)
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '1f9aca7cffmsh9e269b6c2d1b848p13966bjsnfaea7bdd643b', // 取得したキー
        'X-RapidAPI-Host': 'youtube-transcripts.p.rapidapi.com'
      }
    };

    const response = await fetch(`https://youtube-transcript3.p.rapidapi.com/api/transcripts/${videoId}`, options);
    const data = await response.json();

    if (!data || !data.transcripts) {
      return NextResponse.json({ error: "No captions available" }, { status: 500 });
    }

    // 字幕の配列を1つのテキストにまとめる (英語字幕を選択)
    const transcriptText = data.transcripts
      .map((t: any) => t.text)
      .join(" ")
      .slice(0, 4500);

    // 2. OpenAIで要約
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a professional video summarizer. Summarize in English with 3 punchy points." 
        },
        { role: "user", content: transcriptText }
      ],
    });

    const points = completion.choices[0].message.content?.split('\n').filter(p => p.trim()) || [];
    return NextResponse.json({ points });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}