import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // 1. YouTube IDの抽出
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;

    if (!videoId) return NextResponse.json({ error: "Invalid YouTube ID" }, { status: 400 });

    // 2. RapidAPIで字幕取得
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'youtube-transcripts.p.rapidapi.com'
      }
    };

    const targetVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const apiUrl = `https://youtube-transcripts.p.rapidapi.com/youtube/transcript?url=${encodeURIComponent(targetVideoUrl)}`;
    
    const response = await fetch(apiUrl, options);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "RapidAPI Error", detail: data }, { status: response.status });
    }

    // 字幕テキストの抽出
    const transcriptText = data.content || data.transcript || ""; 
    if (!transcriptText) return NextResponse.json({ error: "No transcript found" }, { status: 404 });

    // 3. OpenAIで要約 (最新のパラメータ形式に修正)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a professional video summarizer. Provide 3 punchy bullet points in English." 
        },
        { 
          role: "user", 
          content: transcriptText.slice(0, 6000) // テキストを直接渡す形式を徹底
        }
      ],
    });

    const points = completion.choices[0].message.content?.split('\n').filter(p => p.trim()) || [];
    
    return NextResponse.json({ points });

  } catch (error: any) {
    console.error("Final Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}